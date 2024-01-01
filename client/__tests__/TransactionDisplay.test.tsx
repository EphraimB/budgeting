import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionDisplay from "../components/TransactionDisplay";

const mockTransactions = [
  {
    account_id: 1,
    current_balance: 900,
    transactions: [
      {
        id: "34ac30d0-5015-4b86-b325-4d198c887882",
        title: "Payroll",
        description: "payroll",
        date: "2024-01-15T11:30:00.000Z",
        amount: 1152,
        tax_rate: 0.26999999999999996,
        total_amount: 840.96,
        balance: 1740.96,
      },
      {
        id: "67838641-243c-40b0-b688-fa1889a9d0d8",
        expense_id: 7,
        title: "Testing",
        description: "Just testing",
        date: "2024-01-27T10:15:12.000Z",
        amount: -9.99,
        tax_rate: 0,
        total_amount: -9.99,
        balance: 1730.97,
      },
    ],
  },
];

describe("TransactionDisplay", () => {
  it("displays transactions when data is fetched", async () => {
    const { getByText } = render(
      <TransactionDisplay transactions={mockTransactions} />
    );

    expect(getByText("Testing")).toBeInTheDocument();
    expect(getByText("Just testing")).toBeInTheDocument();
    expect(getByText("$1730.97")).toBeInTheDocument();
    expect(getByText("0%")).toBeInTheDocument();
  });
});
