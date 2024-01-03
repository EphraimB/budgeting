import React from "react";
import { render } from "@testing-library/react";
import AccountEdit from "../../components/AccountEdit";
import "@testing-library/jest-dom";

describe("AccountEdit", () => {
  it("renders", () => {
    const { getByText, getByDisplayValue } = render(
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

    expect(getByText("Account name")).toBeInTheDocument();
    expect(getByDisplayValue("Test Account")).toBeInTheDocument();
    expect(getByText("Edit Account")).toBeInTheDocument();
  });
});
