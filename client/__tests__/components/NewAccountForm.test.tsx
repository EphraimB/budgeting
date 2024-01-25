import React from "react";
import { render, screen } from "@testing-library/react";
import NewAccountForm from "../../components/NewAccountForm";
import "@testing-library/jest-dom";

describe("NewAccountForm", () => {
  test("renders NewAccountForm component", () => {
    const setShowNewAccountForm = jest.fn();

    render(<NewAccountForm setShowNewAccountForm={setShowNewAccountForm} />);

    expect(screen.getByLabelText("more")).toBeInTheDocument();
    expect(screen.getByLabelText("Account name")).toBeInTheDocument();
    expect(screen.getByText("Open Account")).toBeInTheDocument();
  });
});
