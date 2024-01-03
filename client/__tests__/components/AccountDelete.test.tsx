import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountDelete from "../../components/AccountDelete";

describe("AccountList", () => {
  it("renders", () => {
    const { getByText } = render(
      <AccountDelete
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_type: "Checking",
          account_balance: 0,
        }}
        setAccountModes={() => {}}
      />
    );
    expect(getByText("Cancel")).toBeInTheDocument();
    expect(getByText("Delete")).toBeInTheDocument();
  });
});
