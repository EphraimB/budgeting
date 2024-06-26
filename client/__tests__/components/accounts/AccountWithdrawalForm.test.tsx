import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountWithdrawalForm from "../../../components/accounts/AccountWithdrawalForm";

describe("AccountWithdrawalForm", () => {
  it("renders", () => {
    render(
      <AccountWithdrawalForm
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 155.99,
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(
      screen.getByText("Withdraw from Test Account account of $155.99")
    ).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Withdraw")).toBeInTheDocument();
  });
});
