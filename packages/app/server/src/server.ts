import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { authenticateRequest } from './auth';
import logger, { logMetric } from './logger';
import { HttpError } from './errors/http';
import { PrismaClient } from './generated/prisma';
import { traceEnrichmentMiddleware } from './middleware/trace-enrichment-middleware';
import {
  TransactionEscrowMiddleware,
  EscrowRequest,
} from './middleware/transaction-escrow-middleware';
import standardRouter from './routers/common';
import inFlightMonitorRouter from './routers/in-flight-monitor';
import { isApiRequest } from './utils';
import { handleX402Request, handleApiKeyRequest } from './handlers';
import { x402DynamicPricingMiddleware } from './middleware/x402';

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
app.use(express.json({ limit: '100mb' }));
app.use(upload.any()); // Handle multipart/form-data with any field names
app.use(compression());
app.use(x402DynamicPricingMiddleware());

// Use common router for utility routes
app.use(standardRouter);

// Use in-flight monitor router for monitoring endpoints
app.use(inFlightMonitorRouter);

// Main route handler
app.all('*', async (req: EscrowRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Handling request');
    const headers = req.headers as Record<string, string>;

    // X402 challenge is handled by the x402 middleware
    const { processedHeaders, echoControlService } = await authenticateRequest(
      headers,
      prisma
    );

    if (isApiRequest(headers)) {
      await handleApiKeyRequest({req, res, processedHeaders, echoControlService});
      return;
    }

    await handleX402Request({req, res, processedHeaders, echoControlService});
    return;
  } catch (error) {
    console.error('Error handling request:', error);
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
    res.status(error.statusCode).json({
      error: error.message,
    });
  } else if (error instanceof Error) {
    logMetric('server.internal_error', 1, {
      error_type: error.name,
      error_message: error.message,
    });
    // Handle other errors with a more specific message
    logger.error('Internal server error', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  } else {
    logMetric('server.internal_error', 1, {
      error_type: 'unknown_error',
    });
    logger.error('Internal server error', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }

  return res.status(500).json({
    erorr: 'Internal Server Error',
  })
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
