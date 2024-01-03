import React from "react";
import { render } from "@testing-library/react";
import AccountView from "../../components/AccountView";
import "@testing-library/jest-dom";

describe("AccountView", () => {
  it("renders", () => {
    const { getByText } = render(
      <AccountView
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 155.99,
        }}
        setAccountModes={() => {}}
      />
    );

    expect(getByText("Test Account")).toBeInTheDocument();
    expect(getByText("$155.99")).toBeInTheDocument();
  });
});
