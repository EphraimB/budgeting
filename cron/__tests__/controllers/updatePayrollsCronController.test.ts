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

describe("POST /api/update-payrolls", () => {
  it("should respond with the new cron job", async () => {
    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(null, "", "");
      }),
    }));

    const { updatePayrollsCron } = await import(
      "../../controllers/updatePayrollsCronController.js"
    );

    mockRequest.body = { employee_id: 1 };

    await updatePayrollsCron(mockRequest as Request, mockResponse);

    const responseObj = {
      status: "success",
      message: "Script executed",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });

  it("should respond with an error if the script fails to execute", async () => {
    jest.mock("child_process", () => ({
      exec: jest.fn((command, callback) => {
        (
          callback as (
            error: Error | null,
            stdout: string,
            stderr: string
          ) => void
        )(new Error("script failed"), "", "");
      }),
    }));

    const { updatePayrollsCron } = await import(
      "../../controllers/updatePayrollsCronController.js"
    );

    mockRequest.body = { employee_id: 1 };

    await updatePayrollsCron(mockRequest as Request, mockResponse);

    const responseObj = {
      status: "error",
      message: "Failed to create cron job",
    };

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
  });
});
