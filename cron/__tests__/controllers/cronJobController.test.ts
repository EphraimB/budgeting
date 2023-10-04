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

  it("should respond with an array of accounts with an unique_id", async () => {
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

  it("should respond with a 404 error message when the account does not exist", async () => {
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

// describe("POST /api/accounts", () => {
//   it("should respond with the new account", async () => {
//     const newAccount = accounts.filter((account) => account.account_id === 1);

//     mockModule(accounts.filter((account) => account.account_id === 1));

//     const { createAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.body = newAccount;

//     await createAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(201);
//     expect(mockResponse.json).toHaveBeenCalledWith(newAccount);
//   });

//   it("should handle errors correctly", async () => {
//     // Arrange
//     const errorMessage = "Error creating account";
//     const error = new Error(errorMessage);
//     mockModule(null, errorMessage);

//     const { createAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.body = accounts.filter((account) => account.account_id === 1);

//     // Act
//     await createAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(400);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       message: "Error creating account",
//     });
//   });
// });

// describe("PUT /api/accounts/:id", () => {
//   it("should respond with the updated account", async () => {
//     const updatedAccount = accounts.filter(
//       (account) => account.account_id === 1
//     );

//     mockModule(accounts.filter((account) => account.account_id === 1));

//     const { updateAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.params = { id: 1 };
//     mockRequest.body = updatedAccount;

//     await updateAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(200);
//     expect(mockResponse.json).toHaveBeenCalledWith(updatedAccount);
//   });

//   it("should handle errors correctly", async () => {
//     // Arrange
//     const errorMessage = "Error updating account";
//     const error = new Error(errorMessage);
//     mockModule(null, errorMessage);

//     const { updateAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.params = { id: 1 };
//     mockRequest.body = accounts.filter((account) => account.account_id === 1);

//     // Act
//     await updateAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(400);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       message: "Error updating account",
//     });
//   });

//   it("should respond with a 404 error message when the account does not exist", async () => {
//     // Arrange
//     mockModule([]);

//     const { updateAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.params = { id: 1 };
//     mockRequest.body = accounts.filter((account) => account.account_id === 1);

//     // Act
//     await updateAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(404);
//     expect(mockResponse.send).toHaveBeenCalledWith("Account not found");
//   });
// });

// describe("DELETE /api/accounts/:id", () => {
//   it("should respond with a success message", async () => {
//     // Arrange
//     mockModule("Successfully deleted account");

//     const { deleteAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.params = { id: 1 };

//     await deleteAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(200);
//     expect(mockResponse.send).toHaveBeenCalledWith(
//       "Successfully deleted account"
//     );
//   });

//   it("should handle errors correctly", async () => {
//     // Arrange
//     const errorMessage = "Error deleting account";
//     const error = new Error(errorMessage);
//     mockModule(null, errorMessage);

//     const { deleteAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.params = { id: 1 };

//     // Act
//     await deleteAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(400);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       message: "Error deleting account",
//     });
//   });

//   it("should respond with a 404 error message when the account does not exist", async () => {
//     // Arrange
//     mockModule([]);

//     const { deleteAccount } = await import(
//       "../../controllers/accountsController.js"
//     );

//     mockRequest.params = { id: 1 };

//     // Act
//     await deleteAccount(mockRequest as Request, mockResponse);

//     // Assert
//     expect(mockResponse.status).toHaveBeenCalledWith(404);
//     expect(mockResponse.send).toHaveBeenCalledWith("Account not found");
//   });
// });
