import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountDelete from "../../../components/accounts/AccountDelete";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/1",
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/account", () => ({
  deleteAccount: jest.fn(),
}));

describe("AccountList", () => {
  it("renders", () => {
    render(
      <AccountDelete
        account={{
          id: 1,
          name: "Test Account",
          balance: 0,
          dateCreated: "2021-01-01",
          dateModified: "2021-01-01",
        }}
        setAccountModes={() => {}}
      />
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
