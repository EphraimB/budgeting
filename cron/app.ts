import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import bodyParser from "body-parser";
import { logger } from "./config/winston.js";
import cronJobRouter from "./routes/cronJobRouter.js";

const app: Express = express();

app.use(bodyParser.json());
app.use("/api/cron", cronJobRouter);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: "Internal server error" });

  next();
});

export default app;
