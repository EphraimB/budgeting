import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountWithdrawalForm from "../../../components/accounts/AccountWithdrawalForm";

describe("AccountWithdrawalForm", () => {
  it("renders", () => {
    render(
      <AccountWithdrawalForm
        account={{
          id: 1,
          name: "Test Account",
          balance: 155.99,
          dateCreated: "2020-01-01",
          dateModified: "2020-01-01",
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
