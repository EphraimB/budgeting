import { jest } from "@jest/globals";
import request from "supertest";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
  type Router,
} from "express";

/**
 *
 * @returns {Promise<Express>} A promise that resolves to an Express app
 */
const createApp = async (): Promise<Express> => {
  const app: Express = express();
  app.use(express.json());

  // Import the module that uses the mock
  const routerModule = await import("../../routes/updatePayrollsCronRouter");
  const updatePayrollsCronRouter: Router = routerModule.default;
  app.use("/", updatePayrollsCronRouter);

  return app;
};

beforeAll(() => {
  jest.mock("../../controllers/updatePayrollsCronController", () => ({
    updatePayrollsCron: (req: Request, res: Response, next: NextFunction) =>
      res.json({ message: "success" }),
  }));
});

afterAll(() => {
  jest.restoreAllMocks();
});

let app: Express;

beforeEach(async () => {
  // Create a new app for each test
  app = await createApp();
});

describe("POST /", () => {
  it("responds with json", async () => {
    const response: request.Response = await request(app)
      .post("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .send({ employee_id: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "success" });
  });
});
