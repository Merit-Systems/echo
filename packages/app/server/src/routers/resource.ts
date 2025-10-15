import { Request, Response, Router } from 'express';
import { tavilySearchRoute } from '../resources/tavily/route';
const resourceRouter: Router = Router();

resourceRouter.post('/tavily/search', async (req: Request, res: Response) => {
  return await tavilySearchRoute(req, res);
});

export default resourceRouter;
