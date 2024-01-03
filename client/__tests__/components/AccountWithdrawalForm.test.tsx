import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountWithdrawalForm from "../../components/AccountWithdrawalForm";

describe("AccountWithdrawalForm", () => {
  it("renders", () => {
    const { getByText, getByDisplayValue, getByLabelText } = render(
      <AccountWithdrawalForm
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 155.99,
        }}
        setAccountModes={() => {}}
      />
    );

    expect(getByLabelText("close")).toBeInTheDocument();
    expect(
      getByText("Withdraw from Test Account account of $155.99")
    ).toBeInTheDocument();
    expect(getByText("Amount")).toBeInTheDocument();
    expect(getByDisplayValue("0")).toBeInTheDocument();
    expect(getByText("Title")).toBeInTheDocument();
    expect(getByText("Description")).toBeInTheDocument();
    expect(getByText("Withdraw")).toBeInTheDocument();
  });
});
