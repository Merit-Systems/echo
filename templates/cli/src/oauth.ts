import crypto from 'crypto';
import http from 'http';
import open from 'open';
import chalk from 'chalk';
import { spinner } from '@clack/prompts';

const ECHO_BASE_URL = 'https://echo.merit.systems';
const CALLBACK_PORT = 8420;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`;

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate PKCE challenge
 */
function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Start OAuth flow with Echo
 */
export async function authenticateWithOAuth(appId: string): Promise<OAuthTokens> {
  const { codeVerifier, codeChallenge } = generatePKCE();

  const authUrl = new URL(`${ECHO_BASE_URL}/api/oauth/authorize`);
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('scope', 'llm:invoke offline_access');

  const s = spinner();

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        const errorDesc = url.searchParams.get('error_description') || 'Unknown error';
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1 style="color: #dc2626;">Authentication Failed</h1>
              <p>${errorDesc}</p>
              <p style="color: #666;">You can close this window.</p>
            </body>
          </html>
        `);
        server.close(() => {
          reject(new Error(`OAuth error: ${errorDesc}`));
        });
        return;
      }

      if (!code) {
        res.writeHead(400);
        res.end('Missing authorization code');
        server.close(() => {
          reject(new Error('Missing authorization code'));
        });
        return;
      }

      // Exchange code for tokens
      try {
        const tokenResponse = await fetch(`${ECHO_BASE_URL}/api/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: appId,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokens = (await tokenResponse.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1 style="color: #10b981;">✓ Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);

        server.close(() => {
          resolve({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
          });
        });
      } catch (error) {
        res.writeHead(500);
        res.end('Failed to exchange authorization code');
        server.close(() => {
          reject(error);
        });
      }
    });

    server.listen(CALLBACK_PORT, async () => {
      s.start('Opening browser for authentication...');

      try {
        await open(authUrl.toString());
        s.stop('Browser opened');
        console.log(chalk.cyan('\n→ Complete the authentication in your browser'));
        console.log(chalk.gray(`  Waiting for callback on port ${CALLBACK_PORT}...\n`));
      } catch (error) {
        s.stop('Failed to open browser');
        console.log(chalk.yellow(`\nPlease open this URL in your browser:\n${authUrl.toString()}\n`));
      }
    });

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      server.close(() => {
        reject(new Error('Authentication timeout'));
      });
    }, 300000);

    // Clear timeout if server closes
    server.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

