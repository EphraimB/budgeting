import React from "react";
import { render } from "@testing-library/react";
import dayjs from "dayjs";

jest.mock("swr", () => ({
  default: jest
    .fn()
    .mockReturnValue({ data: null, error: null, isLoading: false }),
}));

describe("TransactionDisplay", () => {
  it("displays loader while fetching data", async () => {
    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    //   useSWR.mockReturnValue({ isLoading: true });

    const { getByRole } = render(
      <TransactionDisplay accountId={1} fromDate={dayjs()} toDate={dayjs()} />
    );

    expect(getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays error message on fetch error", async () => {
    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    //   useSWR.mockReturnValue({ error: new Error("Fetch error") });

    const { getByText } = render(
      <TransactionDisplay accountId={1} fromDate={dayjs()} toDate={dayjs()} />
    );

    expect(getByText("failed to load")).toBeInTheDocument();
  });

  it("displays transactions when data is fetched", async () => {
    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const mockData = [
      {
        transactions: [
          {
            id: 1,
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
    // useSWR.mockReturnValue({ data: mockData });

    const { getByText } = render(
      <TransactionDisplay accountId={1} fromDate={dayjs()} toDate={dayjs()} />
    );

    expect(getByText("Test Transaction")).toBeInTheDocument();
    expect(getByText("$100")).toBeInTheDocument();
    expect(getByText("5%")).toBeInTheDocument();
  });
});
