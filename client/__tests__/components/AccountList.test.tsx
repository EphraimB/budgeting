import React from "react";
import { render, screen } from "@testing-library/react";
import AccountList from "../../components/AccountList";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("AccountList", () => {
  it("renders accounts correctly", () => {
    const mockAccounts = [
      { account_id: 1, account_name: "Account A", account_balance: 100 },
      { account_id: 2, account_name: "Account B", account_balance: 200 },
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
