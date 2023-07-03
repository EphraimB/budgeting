import express, { Express, Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello World!');
});

export default router;
