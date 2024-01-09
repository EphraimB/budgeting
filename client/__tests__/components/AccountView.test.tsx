import React from "react";
import { render, screen } from "@testing-library/react";
import AccountView from "../../components/AccountView";
import "@testing-library/jest-dom";

describe("AccountView", () => {
  it("renders", () => {
    render(
      <AccountView
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 155.99,
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByText("Test Account")).toBeInTheDocument();
    expect(screen.getByText("$155.99")).toBeInTheDocument();
  });
});
