import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountDepositForm from "../../../components/accounts/AccountDepositForm";

jest.mock("../../../services/actions/transactionHistory", () => ({
  addTransactionHistory: jest.fn(),
}));

describe("AccountDepositForm", () => {
  it("renders", () => {
    render(
      <AccountDepositForm
        account={{
          id: 1,
          name: "Test Account",
          balance: 155.99,
          dateCreated: "2022-12-31",
          dateModified: "2022-12-31",
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
