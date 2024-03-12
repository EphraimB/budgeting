import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountDelete from "../../components/AccountDelete";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/1",
}));

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("AccountList", () => {
  it("renders", () => {
    render(
      <AccountDelete
        account={{
          account_id: 1,
          account_name: "Test Account",
          account_balance: 0,
          date_created: "2021-01-01",
          date_modified: "2021-01-01",
        }}
        setAccountModes={() => {}}
      />
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
