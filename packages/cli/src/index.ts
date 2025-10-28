import { createInterface } from "readline/promises";
import { createServer } from "http";
import { randomBytes, createHash } from "crypto";
import { homedir } from "os";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { config } from "dotenv";
import ora from "ora";
import chalk from "chalk";

// Load environment variables
config();

const cyan = chalk.cyan;
const CONFIG_DIR = join(homedir(), ".echo-cli");
const TOKEN_FILE = join(CONFIG_DIR, "token.json");
const ECHO_CONTROL_URL = process.env.ECHO_CONTROL_URL || "https://echo.merit.systems";

// Ensure config directory exists
if (!existsSync(CONFIG_DIR)) {
  mkdirSync(CONFIG_DIR, { recursive: true });
}

// PKCE helpers
function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
  return randomBytes(16).toString("hex");
}

// Token storage
interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

function saveToken(data: TokenData) {
  writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
}

function loadToken(): TokenData | null {
  if (!existsSync(TOKEN_FILE)) return null;
  try {
    return JSON.parse(readFileSync(TOKEN_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function clearToken() {
  if (existsSync(TOKEN_FILE)) {
    writeFileSync(TOKEN_FILE, "");
  }
}

// OAuth login flow
async function login(appId?: string): Promise<string> {
  // Check if app ID is provided
  const clientId = appId || process.env.ECHO_APP_ID;

  if (!clientId) {
    console.error(chalk.red("\n❌ ECHO_APP_ID is required\n"));
    console.log(chalk.yellow("To use this CLI, you need an Echo app ID.\n"));
    console.log("Option 1: Create an Echo app");
    console.log(`  1. Visit ${chalk.cyan("https://echo.merit.systems")}`);
    console.log("  2. Create an account and login");
    console.log("  3. Create a new Echo app");
    console.log("  4. Copy the app ID\n");
    console.log("Option 2: Set the app ID");
    console.log(`  ${chalk.cyan("export ECHO_APP_ID=your-app-id-here")}`);
    console.log(`  Or create a .env file with: ${chalk.cyan("ECHO_APP_ID=your-app-id-here")}\n`);
    throw new Error("ECHO_APP_ID is required");
  }

  const spinner = ora("Starting OAuth login flow...").start();

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();
  const redirectUri = "http://localhost:8402/callback";

  return new Promise((resolve, reject) => {
    let authCode: string | null = null;

    const server = createServer((req, res) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);

      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`<h1>Authentication failed</h1><p>Error: ${error}</p>`);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (!code || returnedState !== state) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authentication failed</h1><p>Invalid state or missing code</p>");
          server.close();
          reject(new Error("Invalid OAuth response"));
          return;
        }

        authCode = code;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <head><title>Echo CLI - Success</title></head>
            <body style="font-family: system-ui; text-align: center; padding: 50px;">
              <h1>✓ Authentication successful!</h1>
              <p>You can close this window and return to your terminal.</p>
            </body>
          </html>
        `);
        server.close();
      }
    });

    server.listen(8402, async () => {
      const authorizeUrl = new URL(`${ECHO_CONTROL_URL}/oauth/authorize`);
      authorizeUrl.searchParams.set("client_id", clientId);
      authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      authorizeUrl.searchParams.set("response_type", "code");
      authorizeUrl.searchParams.set("code_challenge", codeChallenge);
      authorizeUrl.searchParams.set("code_challenge_method", "S256");
      authorizeUrl.searchParams.set("state", state);
      authorizeUrl.searchParams.set("scope", "llm:invoke offline_access");

      spinner.succeed("OAuth server started");
      console.log(chalk.yellow("\nPlease visit the following URL to authenticate:\n"));
      console.log(chalk.cyan(authorizeUrl.toString()));
      console.log(chalk.yellow("\nWaiting for authentication...\n"));
    });

    server.on("close", async () => {
      if (!authCode) {
        reject(new Error("Server closed without receiving auth code"));
        return;
      }

      spinner.start("Exchanging authorization code for token...");

      try {
        const tokenResponse = await fetch(`${ECHO_CONTROL_URL}/api/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
        }

        const tokenData = await tokenResponse.json();

        saveToken({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Date.now() + (tokenData.expires_in * 1000),
        });

        spinner.succeed("Login successful!");
        resolve(tokenData.access_token);
      } catch (error) {
        spinner.fail("Token exchange failed");
        reject(error);
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timeout"));
    }, 300000);
  });
}

// Get valid access token (login if needed)
async function getAccessToken(): Promise<string> {
  const tokenData = loadToken();

  if (!tokenData) {
    console.log(chalk.yellow("Not logged in. Starting authentication...\n"));
    return await login();
  }

  // Check if token is expired (with 5 min buffer)
  if (tokenData.expires_at && tokenData.expires_at < Date.now() + 300000) {
    console.log(chalk.yellow("Token expired. Re-authenticating...\n"));
    return await login();
  }

  return tokenData.access_token;
}

// Chat with Echo API
async function chat(prompt: string, token: string) {
  const spinner = ora("Processing your request...").start();

  try {
    console.log(chalk.gray("\n[DEBUG] Making API request..."));
    console.log(chalk.gray(`[DEBUG] Token: ${token.substring(0, 20)}...`));

    const response = await fetch("https://router.echo.merit.systems/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    console.log(chalk.gray(`[DEBUG] Response status: ${response.status}`));
    console.log(chalk.gray(`[DEBUG] Response ok: ${response.ok}`));

    if (!response.ok) {
      const errorText = await response.text();
      console.log(chalk.red(`[DEBUG] Error response: ${errorText}`));
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    spinner.succeed("Response received");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    console.log("");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              process.stdout.write(cyan(content));
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    console.log("\n");
  } catch (error) {
    spinner.fail("Error processing request");
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

// Main CLI
const banner = `
*~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~*

███████╗ ██████╗██╗  ██╗ ██████╗      ██████╗██╗     ██╗
██╔════╝██╔════╝██║  ██║██╔═══██╗    ██╔════╝██║     ██║
█████╗  ██║     ███████║██║   ██║    ██║     ██║     ██║
██╔══╝  ██║     ██╔══██║██║   ██║    ██║     ██║     ██║
███████╗╚██████╗██║  ██║╚██████╔╝    ╚██████╗███████╗██║
╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝      ╚═════╝╚══════╝╚═╝

Terminal Chat • Powered by Echo
Pay-per-use AI • No subscriptions
*~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~**~*~*
`;

async function main() {
  console.log(cyan(banner));

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Get token (login if needed)
  let token: string;
  try {
    token = await getAccessToken();
  } catch (error) {
    console.error(chalk.red("Authentication failed:"), error);
    process.exit(1);
  }

  console.log(chalk.gray('Type your message or "exit" to quit\n'));

  rl.setPrompt(cyan("You: "));
  rl.prompt();

  rl.on("line", async (input) => {
    const trimmed = input.trim();

    if (!trimmed) {
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === "exit") {
      console.log(cyan("Goodbye!"));
      rl.close();
      process.exit(0);
    }

    if (trimmed.toLowerCase() === "logout") {
      clearToken();
      console.log(chalk.yellow("Logged out successfully"));
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === "login") {
      try {
        token = await login();
      } catch (error) {
        console.error(chalk.red("Login failed:"), error);
      }
      rl.prompt();
      return;
    }

    await chat(trimmed, token);
    rl.prompt();
  });

  rl.on("close", () => {
    console.log(cyan("\nGoodbye!"));
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
