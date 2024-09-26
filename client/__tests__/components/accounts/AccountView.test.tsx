import React from "react";
import { render, screen } from "@testing-library/react";
import AccountView from "../../../components/accounts/AccountView";
import "@testing-library/jest-dom";

describe("AccountView", () => {
  it("renders", () => {
    render(
      <AccountView
        account={{
          id: 1,
          name: "Test Account",
          balance: 155.99,
          dateCreated: "2022-01-01",
          dateModified: "2022-01-01",
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByText("Test Account")).toBeInTheDocument();
    expect(screen.getByText("$155.99")).toBeInTheDocument();
  });
});
