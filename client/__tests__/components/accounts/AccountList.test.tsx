import React from "react";
import { render, screen } from "@testing-library/react";
import AccountList from "../../../components/accounts/AccountList";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("../../../services/actions/account", () => ({
  addAccount: jest.fn(),
  editAccount: jest.fn(),
  deleteAccount: jest.fn(),
}));

jest.mock("../../../services/actions/transactionHistory", () => ({
  addTransactionHistory: jest.fn(),
}));

describe("AccountList", () => {
  it("renders accounts correctly", () => {
    const mockAccounts = [
      {
        id: 1,
        name: "Account A",
        balance: 100,
        dateCreated: "2022-01-01",
        dateModified: "2022-01-01",
      },
      {
        id: 2,
        name: "Account B",
        balance: 200,
        dateCreated: "2022-01-01",
        dateModified: "2022-01-01",
      },
    ];

    render(<AccountList accounts={mockAccounts} />);

    // Check if the accounts are rendered with the correct values
    expect(screen.getByText("Account A")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("Account B")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();

    const tooltip = screen.getByLabelText("Open new account");
    expect(tooltip).toBeInTheDocument();
  });
});
