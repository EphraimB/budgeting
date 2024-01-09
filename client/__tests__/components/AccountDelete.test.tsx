import React from "react";
import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
