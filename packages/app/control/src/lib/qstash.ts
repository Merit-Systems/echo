import { Client } from '@upstash/qstash';
import { logger } from '@/logger';
import { env } from '@/env';

declare global {
  var qstashClient: Client | undefined;
}

let qstashClient: Client;

if (env.NODE_ENV === 'production') {
  logger.emit({
    body: 'Initializing Prisma client in production',
    severityText: 'INFO',
  });
  qstashClient = new Client({
    // Add your token to a .env file
    token: env.QSTASH_TOKEN,
  });
} else {
  if (!globalThis.qstashClient) {
    globalThis.qstashClient = new Client({
      token: env.QSTASH_TOKEN,
    });
  }
  qstashClient = globalThis.qstashClient;
}

export { qstashClient };
