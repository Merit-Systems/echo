import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import type { SessionManager } from './session-manager';

export function setupMCPRoutes(
  sessionManager: SessionManager
): express.Application {
  const app = express();

  app.use(
    cors({
      origin: '*', // use "*" with caution in production
      methods: 'GET,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: [
        'mcp-session-id',
        'last-event-id',
        'mcp-protocol-version',
      ],
    })
  ); // Enable CORS for all routes so Inspector can connect

  // Handle MCP POST requests (initialization and regular requests)
  app.post('/mcp', async (req: Request, res: Response) => {
    console.error('Received MCP POST request');
    try {
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;

      if (sessionId && sessionManager.hasSession(sessionId)) {
        // Reuse existing session
        const session = sessionManager.getSession(sessionId)!;
        await session.transport.handleRequest(req, res);
        return;
      } else if (!sessionId) {
        // New initialization request
        await sessionManager.createSession(req, res);
        return;
      } else {
        // Invalid request - session ID provided but not found
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: Session not found or invalid',
          },
          id: (req.body as { id?: string })?.id,
        });
        return;
      }
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: (req.body as { id?: string })?.id,
        });
      }
    }
  });

  // Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
  app.get('/mcp', async (req: Request, res: Response) => {
    console.error('Received MCP GET request');
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !sessionManager.hasSession(sessionId)) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: (req.body as { id?: string })?.id,
      });
      return;
    }

    // Check for Last-Event-ID header for resumability
    const lastEventId = req.headers['last-event-id'] as string | undefined;
    if (lastEventId) {
      console.error(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
    } else {
      console.error(`Establishing new SSE stream for session ${sessionId}`);
    }

    const session = sessionManager.getSession(sessionId)!;
    await session.transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination (according to MCP spec)
  app.delete('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !sessionManager.hasSession(sessionId)) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: (req.body as { id?: string })?.id,
      });
      return;
    }

    console.error(
      `Received session termination request for session ${sessionId}`
    );

    try {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        await session.transport.handleRequest(req, res);
      }
    } catch (error) {
      console.error('Error handling session termination:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Error handling session termination',
          },
          id: (req.body as { id?: string })?.id,
        });
        return;
      }
    }
  });

  return app;
}
