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
  const routerModule = await import("../../routes/cronJobRouter");
  const cronJobRouter: Router = routerModule.default;
  app.use("/", cronJobRouter);

  return app;
};

beforeAll(() => {
  jest.mock("../../controllers/cronJobController", () => ({
    getCronJobs: (req: Request, res: Response, next: NextFunction) =>
      res.json({ message: "success" }),
    createCronJob: (req: Request, res: Response, next: NextFunction) =>
      res.json({ message: "success" }),
    updateCronJob: (req: Request, res: Response, next: NextFunction) =>
      res.json({ message: "success" }),
    deleteCronJob: (req: Request, res: Response, next: NextFunction) =>
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

describe("GET /", () => {
  it("responds with json", async () => {
    const response: request.Response = await request(app)
      .get("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "success" });
  });
});

describe("GET / with unique_id query", () => {
  it("responds with json", async () => {
    const response: request.Response = await request(app)
      .get("/?unique_id=1")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "success" });
  });
});

describe("POST /", () => {
  it("responds with json", async () => {
    const newCronJob = {
      schedule: "* * * * *",
      script_path: "test",
      expense_type: "test",
      account_id: 1,
      id: 1,
      amount: 100,
      title: "test",
      description: "test",
    };

    const response: request.Response = await request(app)
      .post("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .send(newCronJob);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "success" });
  });
});

describe("PUT /:id", () => {
  it("responds with json", async () => {
    const updatedCronJob = {
      schedule: "* * * * *",
      script_path: "test",
      expense_type: "test",
      account_id: 1,
      id: 1,
      amount: 100,
      title: "test",
      description: "test",
    };

    const response: request.Response = await request(app)
      .put("/1")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .send(updatedCronJob);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "success" });
  });
});

describe("DELETE /:id", () => {
  it("responds with json", async () => {
    const response: request.Response = await request(app)
      .delete("/1")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "success" });
  });
});
