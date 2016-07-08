import { Router, Request, Response } from 'express';

var router = Router();

router.post('/', (req: Request, res: Response) => {
  var message = req.body.message;
  if (!message || typeof message !== 'string') {
    res.status(400).send({
      error: 'Error must have a message'
    });
  } else {
    console.error(`Client Error: ${JSON.stringify(req.body)}`);
    res.send(`Error logged @ ${new Date().toISOString()}`);
  }
});

export = router;
