import type { Request, Response } from 'express';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { InMemoryEventStore } from '@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js';
import { randomUUID } from 'node:crypto';

interface SessionInfo {
  transport: StreamableHTTPServerTransport;
  server: Server;
}

export class SessionManager {
  private sessions = new Map<string, SessionInfo>();

  constructor(private createServerFn: () => { server: Server }) {}

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getSession(sessionId: string): SessionInfo | undefined {
    return this.sessions.get(sessionId);
  }

  async createSession(req: Request, res: Response): Promise<void> {
    const { server } = this.createServerFn();

    const eventStore = new InMemoryEventStore();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      eventStore, // Enable resumability
      onsessioninitialized: (sessionId: string) => {
        // Store the session info when session is initialized
        console.error(`Session initialized with ID: ${sessionId}`);
        this.sessions.set(sessionId, { transport, server });
      },
    });

    // Set up onclose handler to clean up session when closed
    server.onclose = () => {
      void (async () => {
        const sid = transport.sessionId;
        if (sid && this.sessions.has(sid)) {
          console.error(
            `Session closed for session ${sid}, removing from sessions map`
          );
          this.sessions.delete(sid);
        }
      })();
    };

    // Connect the transport to the MCP server BEFORE handling the request
    await server.connect(transport);

    await transport.handleRequest(req, res);
  }

  async closeAllSessions(): Promise<void> {
    // Close all active sessions to properly clean up resources
    for (const [sessionId, session] of this.sessions) {
      try {
        console.error(`Closing session ${sessionId}`);
        await session.transport.close();
        this.sessions.delete(sessionId);
      } catch (error) {
        console.error(`Error closing session ${sessionId}:`, error);
      }
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }
}
