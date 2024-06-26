import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountDepositForm from "../../../components/accounts/AccountDepositForm";

describe("AccountDepositForm", () => {
  it("renders", () => {
    render(
      <AccountDepositForm
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 155.99,
          date_created: "2022-12-31",
          date_modified: "2022-12-31",
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(
      screen.getByText("Deposit into Test Account account of $155.99")
    ).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Deposit")).toBeInTheDocument();
  });
});
