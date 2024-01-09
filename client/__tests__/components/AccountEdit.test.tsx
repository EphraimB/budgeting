import React from "react";
import { render, screen } from "@testing-library/react";
import AccountEdit from "../../components/AccountEdit";
import "@testing-library/jest-dom";

describe("AccountEdit", () => {
  it("renders", () => {
    render(
      <AccountEdit
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_type: "Checking",
          account_balance: 0,
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByText("Account name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
    expect(screen.getByText("Edit Account")).toBeInTheDocument();
  });
});
