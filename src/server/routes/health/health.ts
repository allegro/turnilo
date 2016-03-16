import { Router, Request, Response } from 'express';

var router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send(`I am healthy @ ${new Date().toISOString()}`);
});

export = router;
