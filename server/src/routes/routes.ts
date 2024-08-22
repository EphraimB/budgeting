import express, { type Request, type Response, type Router } from 'express';

const router: Router = express.Router();

router.get('/', (_: Request, res: Response) => {
    res.status(200).send('Hello World!');
});

export default router;
