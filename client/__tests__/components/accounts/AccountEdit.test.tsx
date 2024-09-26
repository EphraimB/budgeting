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
          id: 1,
          name: "Test Account",
          balance: 0,
          dateCreated: "2022-12-31",
          dateModified: "2022-12-31",
        }}
        setAccountModes={() => {}}
      />
    );

    expect(screen.getByText("Account name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
    expect(screen.getByText("Edit Account")).toBeInTheDocument();
  });
});
