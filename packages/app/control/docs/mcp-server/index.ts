#!/usr/bin/env node

import dotenv from 'dotenv';
import { join } from 'path';
import { SessionManager } from './session-manager';
import { setupMCPRoutes } from './mcp-routes';
import { createServer } from './server';

// Load environment variables from .env file in project root
dotenv.config({ path: join(process.cwd(), '.env') });

// Create session manager with server factory function
const sessionManager = new SessionManager(createServer);

// Setup MCP routes with session manager
const app = setupMCPRoutes(sessionManager);

// Start the server
const PORT = process.env.PORT ?? 3059;
app.listen(PORT, () => {
  console.error(`Echo Docs MCP Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  void (async () => {
    console.error('Shutting down server...');

    // Close all active sessions to properly clean up resources
    await sessionManager.closeAllSessions();

    console.error('Server shutdown complete');
    process.exit(0);
  })();
});
