import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { authenticateRequest } from './auth';
import { HttpError } from './errors/http';
import { PrismaClient } from './generated/prisma';
import logger, { logMetric } from './logger';
import { traceEnrichmentMiddleware } from './middleware/trace-enrichment-middleware';
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

app.use(traceEnrichmentMiddleware);

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

// Use common router for utility routes
app.use(standardRouter);

// Use in-flight monitor router for monitoring endpoints
app.use(inFlightMonitorRouter);

// Main route handler
app.all('*', async (req: EscrowRequest, res: Response, next: NextFunction) => {
  try {
    const headers = req.headers as Record<string, string>;
    const { provider, isStream, isPassthroughProxyRoute } =
      await initializeProvider(req, res);
    const maxCost = getRequestMaxCost(req, provider, isPassthroughProxyRoute);

    if (!isApiRequest(headers) && !isX402Request(headers)) {
      return buildX402Response(req, res, maxCost);
    }

    if (isX402Request(headers)) {
      return handleX402Request({
        req,
        res,
        headers,
        maxCost,
        isPassthroughProxyRoute,
        provider,
        isStream,
      });
    }

    if (isApiRequest(headers)) {
      const { processedHeaders, echoControlService } = await authenticateRequest(
        headers,
        prisma
      );
      provider.setEchoControlService(echoControlService);

      return handleApiKeyRequest({
        req,
        res,
        headers: processedHeaders,
        echoControlService,
        isPassthroughProxyRoute,
        provider,
        isStream,
        maxCost,
      });
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

  if (error instanceof HttpError) {
    logMetric('server.internal_error', 1, {
      error_type: 'http_error',
      error_message: error.message,
    });
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
