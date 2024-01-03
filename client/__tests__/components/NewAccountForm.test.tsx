import React from "react";
import { render } from "@testing-library/react";
import NewAccountForm from "../../components/NewAccountForm";
import "@testing-library/jest-dom";

describe("NewAccountForm", () => {
  test("renders NewAccountForm component", () => {
    const setShowNewAccountForm = jest.fn();

    const { getByText, getByLabelText } = render(
      <NewAccountForm setShowNewAccountForm={setShowNewAccountForm} />
    );

    expect(getByLabelText("more")).toBeInTheDocument();
    expect(getByLabelText("Account name")).toBeInTheDocument();
    expect(getByText("Open Account")).toBeInTheDocument();
  });
});
