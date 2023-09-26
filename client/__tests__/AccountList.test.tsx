import React from "react";
import { render, fireEvent } from "@testing-library/react";
import AccountList from "../components/AccountList";
import "@testing-library/jest-dom";

describe("AccountList", () => {
  it("renders accounts correctly and responds to account click", () => {
    const mockAccounts = [
      { account_id: 1, account_name: "Account A", account_balance: 100 },
      { account_id: 2, account_name: "Account B", account_balance: 200 },
    ];

    const onAccountClick = jest.fn();

    const { getByText } = render(
      <AccountList
        accounts={mockAccounts}
        onAccountClick={onAccountClick}
        selectedAccountId={1}
      />
    );

    // Check if the accounts are rendered with the correct values
    expect(getByText("Account A")).toBeInTheDocument();
    expect(getByText("$100")).toBeInTheDocument();
    expect(getByText("Account B")).toBeInTheDocument();
    expect(getByText("$200")).toBeInTheDocument();

    // Simulate clicking on an account and check if onAccountClick is called with the correct account
    fireEvent.click(getByText("Account A"));
    expect(onAccountClick).toHaveBeenCalledWith(mockAccounts[0]);

    // Check if the "Open New Account" button is rendered
    expect(getByText("Open New Account")).toBeInTheDocument();
  });
});
