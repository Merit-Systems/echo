import { Request, Response, Router } from 'express';
import { tavilySearchRoute } from '../resources/tavily/search/route';
import { tavilyExtractRoute } from '../resources/tavily/extract/route';
import { tavilyCrawlRoute } from '../resources/tavily/crawl/route';
import { e2bExecuteRoute } from '../resources/e2b/route';

const resourceRouter: Router = Router();

resourceRouter.post('/tavily/search', async (req: Request, res: Response) => {
  return await tavilySearchRoute(req, res);
});

resourceRouter.post('/tavily/extract', async (req: Request, res: Response) => {
  return await tavilyExtractRoute(req, res);
});

resourceRouter.post('/tavily/crawl', async (req: Request, res: Response) => {
  return await tavilyCrawlRoute(req, res);
});

resourceRouter.post('/e2b/execute', async (req: Request, res: Response) => {
  return await e2bExecuteRoute(req, res);
});

export default resourceRouter;
