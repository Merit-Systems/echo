import { Router, Request, Response } from 'express';
import logger, { logMetric } from '../logger';
const standardRouter = Router();

// Health check route
standardRouter.get('/health', (req: Request, res: Response) => {
  logger.info('Server is healthy');
  logMetric('server.health', 1);
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
  });
});

standardRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
  });
});

// Handle favicon and other common browser requests
standardRouter.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).send(); // No content
});

// Handle robots.txt
standardRouter.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

export default standardRouter as Router;
