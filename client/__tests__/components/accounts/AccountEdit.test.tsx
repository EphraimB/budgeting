import React from "react";
import { render, screen } from "@testing-library/react";
import AccountEdit from "../../../components/accounts/AccountEdit";
import "@testing-library/jest-dom";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("AccountEdit", () => {
  it("renders", () => {
    render(
      <AccountEdit
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 0,
          date_created: "2022-12-31",
          date_modified: "2022-12-31",
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByText("Account name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
    expect(screen.getByText("Edit Account")).toBeInTheDocument();
  });
});
