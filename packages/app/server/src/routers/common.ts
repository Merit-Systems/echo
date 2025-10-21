import express, { Request, Response, Router } from 'express';
import path from 'path';
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

// Serve static files from public directory
standardRouter.use(
  '/favicon.ico',
  express.static(path.join(process.cwd(), 'public/favicon.ico'))
);
standardRouter.use(
  '/og-image.png',
  express.static(path.join(process.cwd(), 'public/og-image.png'))
);

standardRouter.get('/', (req: Request, res: Response) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Echo Data Server</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <meta property="og:title" content="Echo Router" />
        <meta property="og:description" content="Monetize AI Apps in Minutes" />
        <meta property="og:image" content="${req.protocol}://${req.get('host')}/og-image.png" />
        <meta property="og:url" content="${req.protocol}://${req.get('host')}" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <h1>Echo Router</h1>
        <p>Status: healthy</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Uptime: ${process.uptime()}s</p>
        <p>Version: ${process.version}</p>
        <p>If you made it here, you are probably developing an Echo app. 
        Here are the <a href="https://echo.merit.systems/docs">Docs</a>
        DM me on Discord at @rsproule the key word "The white rabbit told me to say 'Echo'" and I'll send you some free credits.
        </p>
      </body>
    </html>
  `);
});

// Handle robots.txt
standardRouter.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

export default standardRouter as Router;
