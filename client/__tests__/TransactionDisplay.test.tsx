import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import dayjs from "dayjs";

describe("TransactionDisplay", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("displays loader while fetching data", async () => {
    jest.mock("swr", () => ({
      __esModule: true,
      default: jest
        .fn()
        .mockReturnValue({ data: null, error: null, isLoading: true }),
    }));

    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const { getByRole } = render(
      <TransactionDisplay accountId={1} fromDate={dayjs()} toDate={dayjs()} />
    );

    expect(getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays error message on fetch error", async () => {
    jest.mock("swr", () => ({
      __esModule: true,
      default: jest.fn().mockReturnValue({
        data: null,
        error: new Error("Failed to fetch"),
        isLoading: false,
      }),
    }));

    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const { getByText } = render(
      <TransactionDisplay accountId={1} fromDate={dayjs()} toDate={dayjs()} />
    );

    expect(getByText("failed to load")).toBeInTheDocument();
  });

  it("displays transactions when data is fetched", async () => {
    const mockData = [
      {
        transactions: [
          {
            id: "eqawd3qfd3",
            date: new Date().toISOString(),
            title: "Test Transaction",
            description: "A test transaction",
            amount: 100,
            tax_rate: 0.05,
            total_amount: 105,
            balance: 1000,
          },
        ],
      },
    ];

    jest.mock("swr", () => ({
      __esModule: true,
      default: jest.fn().mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
      }),
    }));

    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const { getByText } = render(
      <TransactionDisplay accountId={1} fromDate={dayjs()} toDate={dayjs()} />
    );

    expect(getByText("Test Transaction")).toBeInTheDocument();
    expect(getByText("$100")).toBeInTheDocument();
    expect(getByText("5%")).toBeInTheDocument();
  });
});
