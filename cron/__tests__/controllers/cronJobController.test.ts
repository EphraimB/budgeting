import { jest } from "@jest/globals";
import { type Request, type Response } from "express";

jest.mock("../../config/winston", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock request and response
let mockRequest: any;
let mockResponse: any;

beforeEach(() => {
  mockRequest = {};
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
});

afterEach(() => {
  jest.resetModules();
});

jest.mock("../../utils/helperFunctions", () => ({
  handleError: jest.fn((res: Response, message: string) => {
    res.status(500).json({ message });
  }),
}));

describe("GET /api/cron", () => {
  it("should respond with an array of cron jobs", async () => {
    // Arrange
    const cronJobs = [
      {
        schedule: "0 0 1 * *",
        script_path:
          "/home/runner/work/expense-tracker/expense-tracker/index.sh",
        expense_type: "wishlist",
        account_id: 1,
        id: 1,
        amount: -1000,
        title: "Wishlist",
        description: "Wishlist for 2021-05-01",
        unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a",
      },
    ];

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          null,
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { getCronJobs } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.query = { unique_id: null };

    // Call the function with the mock request and response
    await getCronJobs(mockRequest as Request, mockResponse);

    const responseObj = {
      data: cronJobs,
      status: "success",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should handle errors correctly", async () => {
    // Arrange
    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          new Error("test"),
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { getCronJobs } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.query = { unique_id: null };

    // Act
    await getCronJobs(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Failed to retrieve cron jobs",
      status: "error",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should respond with an array of cron jobs with an unique_id", async () => {
    // Arrange
    const cronJobs = {
      schedule: "0 0 1 * *",
      script_path: "/home/runner/work/expense-tracker/expense-tracker/index.sh",
      expense_type: "wishlist",
      account_id: 1,
      id: 1,
      amount: -1000,
      title: "Wishlist",
      description: "Wishlist for 2021-05-01",
      unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a",
    };

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          null,
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { getCronJobs } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.query = { unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a" };

    // Call the function with the mock request and response
    await getCronJobs(mockRequest as Request, mockResponse);

    const responseObj = {
      data: cronJobs,
      status: "success",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should handle errors correctly with an unique_id", async () => {
    // Arrange
    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          new Error("test"),
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { getCronJobs } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.query = { unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a" };

    // Act
    await getCronJobs(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Failed to retrieve cron jobs",
      status: "error",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should respond with a 404 error message when the cron jobs does not exist", async () => {
    // Arrange
    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          null,
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { getCronJobs } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.query = { unique_id: "924qf9gq" };

    // Act
    await getCronJobs(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Cron job not found",
      status: "error",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });
});

describe("POST /api/cron", () => {
  it("should respond with the new cron job", async () => {
    const newCronJob = {
      schedule: "* * * * *",
      script_path: "test",
      expense_type: "test",
      account_id: 1,
      id: 1,
      amount: -1000,
      title: "test",
      description: "test",
    };

    jest.mock("uuid", () => ({
      v4: jest.fn(() => "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a"),
    }));

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          null,
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { createCronJob } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.body = newCronJob;

    await createCronJob(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Cron job created successfully",
      status: "success",
      unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should handle errors correctly", async () => {
    // Arrange
    const newCronJob = {
      schedule: "* * * * *",
      script_path: "test",
      expense_type: "test",
      account_id: 1,
      id: 1,
      amount: -1000,
      title: "test",
      description: "test",
    };

    jest.mock("uuid", () => ({
      v4: jest.fn(() => "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a"),
    }));

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          new Error("test"),
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { createCronJob } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.body = newCronJob;

    // Act
    await createCronJob(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Failed to create cron job",
      status: "error",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });
});

describe("PUT /api/cron/:id", () => {
  it("should respond with the updated cron job", async () => {
    const updatedCronJob = {
      schedule: "* * * * *",
      script_path: "test",
      expense_type: "test",
      account_id: 1,
      id: 1,
      amount: -1000,
      title: "test",
      description: "test",
    };

    jest.mock("uuid", () => ({
      v4: jest.fn(() => "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a"),
    }));

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          null,
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { updateCronJob } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.params = { unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a" };
    mockRequest.body = updatedCronJob;

    await updateCronJob(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Cron job updated successfully",
      status: "success",
      unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should respond with a 404 error message if the cron job does not exist", async () => {
    // Arrange
    const updatedCronJob = {
      schedule: "* * * * *",
      script_path: "test",
      expense_type: "test",
      account_id: 1,
      id: 1,
      amount: -1000,
      title: "test",
      description: "test",
    };

    jest.mock("uuid", () => ({
      v4: jest.fn(() => "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a"),
    }));

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          new Error("test"),
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { updateCronJob } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.params = { unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a" };
    mockRequest.body = updateCronJob;

    // Act
    await updateCronJob(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Cron job not found",
      status: "error",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });
});

describe("DELETE /api/cron/:id", () => {
  it("should respond with a success message", async () => {
    // Arrange
    jest.mock("uuid", () => ({
      v4: jest.fn(() => "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a"),
    }));

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          null,
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { deleteCronJob } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.params = { unique_id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a" };

    await deleteCronJob(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Cron job deleted successfully",
      status: "success",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should respond with a 404 error message when the cron job does not exist", async () => {
    // Arrange
    jest.mock("uuid", () => ({
      v4: jest.fn(() => "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a"),
    }));

    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(
          new Error("test"),
          '0 0 1 * * /home/runner/work/expense-tracker/expense-tracker/index.sh wishlist_1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a 1 1 -1000 "Wishlist" "Wishlist for 2021-05-01"',
          ""
        );
      }),
    }));

    const { deleteCronJob } = await import(
      "../../controllers/cronJobController.js"
    );

    mockRequest.params = { id: "1c4d0f1a-1b1a-4b1a-9b1a-1b1a1b1a1b1a" };

    // Act
    await deleteCronJob(mockRequest as Request, mockResponse);

    const responseObj = {
      message: "Cron job not found",
      status: "error",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });
});