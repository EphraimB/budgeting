import express, {
    type Express,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/routes.js";
import accountsRouter from "./routes/accountsRouter.js";
import transactionHistoryRouter from "./routes/transactionHistoryRouter.js";
import expensesRouter from "./routes/expensesRouter.js";
import loansRouter from "./routes/loansRouter.js";
import payrollRouter from "./routes/payrollRouter.js";
import payrollDatesRouter from "./routes/payrollDatesRouter.js";
import payrollTaxesRouter from "./routes/payrollTaxesRouter.js";
import payrollEmployeeRouter from "./routes/payrollEmployeeRouter.js";
import wishlistRouter from "./routes/wishlistRouter.js";
import transferRouter from "./routes/transfersRouter.js";
import transactionsRouter from "./routes/transactionsRouter.js";
import taxesRouter from "./routes/taxesRouter.js";
import incomeRouter from "./routes/incomeRouter.js";
import fs from "fs";
import path from "path";

const swaggerDocument = JSON.parse(
    fs.readFileSync(
        path.resolve(process.cwd(), "./dist/views/swagger.json"),
        "utf8",
    ),
);

const app: Express = express();

app.use(bodyParser.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/", routes);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions/history", transactionHistoryRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/loans", loansRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/payroll/dates", payrollDatesRouter);
app.use("/api/payroll/taxes", payrollTaxesRouter);
app.use("/api/payroll/employee", payrollEmployeeRouter);
app.use("/api/wishlists", wishlistRouter);
app.use("/api/transfers", transferRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/taxes", taxesRouter);
app.use("/api/income", incomeRouter);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

export default app;
