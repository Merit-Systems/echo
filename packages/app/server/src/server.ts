// Load OpenTelemetry instrumentation before any other imports
try {
  require('@opentelemetry/auto-instrumentations-node/register');
  console.log('✅ OpenTelemetry loaded');
} catch (err: any) {
  console.warn('⚠️ OpenTelemetry not available:', err.message);
}

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { authenticateRequest } from './auth';
import { HttpError } from './errors/http';
import { PrismaClient } from './generated/prisma';
import logger, { logMetric } from './logger';
import {
  traceLoggingMiddleware,
  traceSetupMiddleware,
} from './middleware/trace-enrichment-middleware';
import {
  EscrowRequest,
  TransactionEscrowMiddleware,
} from './middleware/transaction-escrow-middleware';
import standardRouter from './routers/common';
import inFlightMonitorRouter from './routers/in-flight-monitor';
import { buildX402Response, isApiRequest, isX402Request } from './utils';
import { handleX402Request, handleApiKeyRequest } from './handlers';
import { initializeProvider } from './services/ProviderInitializationService';
import { getRequestMaxCost } from './services/PricingService';
import { Decimal } from '@prisma/client/runtime/library';
import resourceRouter from './routers/resource';
import { x402Router } from 'routers/x402-credit';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3069;

// Configure multer for handling form data and file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ?? 'postgresql://localhost:5469/echo',
    },
  },
  log: ['warn', 'error'],
});

// Initialize the transaction escrow middleware
const transactionEscrowMiddleware = new TransactionEscrowMiddleware(prisma);

// This ensures all logs (including body parsing errors) have requestId
app.use(traceSetupMiddleware);

// Add middleware
app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: '*', // Allow all headers
    exposedHeaders: '*', // Expose all headers to the client
    credentials: false, // Set to false when using origin: '*'
    preflightContinue: false, // Handle preflight requests here
    optionsSuccessStatus: 200, // Return 200 for preflight OPTIONS requests
  })
);

// Preserve content-length before body parsing middleware removes it
app.use((req: EscrowRequest, res, next) => {
  // Capture Content-Length from raw request before any parsing
  const rawContentLength = req.headers['content-length'];

  if (rawContentLength) {
    req.originalContentLength = rawContentLength;
  }
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(upload.any()); // Handle multipart/form-data with any field names
app.use(compression());

app.use(traceLoggingMiddleware);

// Use common router for utility routes
app.use(standardRouter);

// Use in-flight monitor router for monitoring endpoints
app.use(inFlightMonitorRouter);

// Use resource router for resource routes
app.use('/resource', resourceRouter);

app.use('/x402', x402Router);

// Main route handler
app.all('*', async (req: EscrowRequest, res: Response, next: NextFunction) => {
  try {
    const headers = req.headers as Record<string, string>;
    const { provider, isStream, isPassthroughProxyRoute, is402Sniffer } =
      await initializeProvider(req, res);
    if (!provider || is402Sniffer) {
      return buildX402Response(req, res, new Decimal(0));
    }
    const maxCost = getRequestMaxCost(req, provider, isPassthroughProxyRoute);

    if (
      !isApiRequest(headers) &&
      !isX402Request(headers) &&
      !isPassthroughProxyRoute
    ) {
      return buildX402Response(req, res, maxCost);
    }

    if (isApiRequest(headers)) {
      const { processedHeaders, echoControlService } =
        await authenticateRequest(headers, prisma);

      provider.setEchoControlService(echoControlService);

      await handleApiKeyRequest({
        req,
        res,
        headers: processedHeaders,
        echoControlService,
        isPassthroughProxyRoute,
        provider,
        isStream,
        maxCost,
      });
      return;
    }
    if (isX402Request(headers) || isPassthroughProxyRoute) {
      await handleX402Request({
        req,
        res,
        headers,
        maxCost,
        isPassthroughProxyRoute,
        provider,
        isStream,
      });
      return;
    }

    return res.status(400).json({
      error: 'No request type found',
    });
  } catch (error) {
    return next(error);
  }
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response) => {
  logger.error(
    `Error handling request: ${error.message} | Stack: ${error.stack}`
  );

  // If response has already been sent, just log the error and return
  if (res.headersSent) {
    logger.warn('Response already sent, cannot send error response');
    return;
  }

  if (error instanceof HttpError) {
    logMetric('server.internal_error', 1, {
      error_type: 'http_error',
      error_message: error.message,
    });
    logger.error('HTTP Error', error);
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  if (error instanceof Error) {
    logMetric('server.internal_error', 1, {
      error_type: error.name,
      error_message: error.message,
    });
    logger.error('Internal server error', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }

  logMetric('server.internal_error', 1, {
    error_type: 'unknown_error',
  });
  logger.error('Internal server error', error);
  return res.status(500).json({
    error: 'Internal Server Error',
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Stop the escrow cleanup process
  transactionEscrowMiddleware.stopCleanupProcess();

  // Close database connections
  prisma
    .$disconnect()
    .then(() => {
      logger.info('Database connections closed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    });
};

// Global error handlers to prevent server crashes
process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      promise,
    });
    logMetric('server.unhandled_rejection', 1, {
      reason: reason instanceof Error ? reason.message : 'unknown',
    });
    // Don't exit - log and continue
  }
);

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  logMetric('server.uncaught_exception', 1, {
    error_message: error.message,
  });
  // For uncaught exceptions, we should exit gracefully
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Only start the server if this file is being run directly
if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

export default app;
