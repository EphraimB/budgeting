import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import dayjs from "dayjs";

const mockTransactions = [
  {
    id: "eqawd3qfd3",
    transaction_id: 1,
    title: "Test Transaction",
    description: "A test transaction",
    date: dayjs("2021-09-03"),
    date_modified: dayjs("2021-09-03"),
    amount: 100,
    tax_rate: 0.05,
    total_amount: 200,
  },
  {
    id: "eqawd3qfd3",
    transaction_id: 2,
    title: "Test Transaction 2",
    description: "A test transaction 2",
    date: dayjs("2021-09-03"),
    date_modified: dayjs("2021-09-03"),
    amount: 100,
    tax_rate: 0.05,
    total_amount: 200,
  },
];

describe("TransactionDisplay", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("displays loader while fetching data", async () => {
    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const { getByRole } = render(
      <TransactionDisplay transactions={mockTransactions} />
    );

    expect(getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays error message on fetch error", async () => {
    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const { getByText } = render(
      <TransactionDisplay transactions={mockTransactions} />
    );

    expect(getByText("failed to load")).toBeInTheDocument();
  });

  it("displays transactions when data is fetched", async () => {
    const TransactionDisplay = (
      await import("../components/TransactionDisplay")
    ).default;

    const { getByText } = render(
      <TransactionDisplay transactions={mockTransactions} />
    );

    expect(getByText("Test Transaction")).toBeInTheDocument();
    expect(getByText("$100")).toBeInTheDocument();
    expect(getByText("5%")).toBeInTheDocument();
  });
});
