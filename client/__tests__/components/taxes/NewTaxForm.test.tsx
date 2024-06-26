import React from "react";
import { render, screen } from "@testing-library/react";
import NewTaxForm from "../../../components/taxes/NewTaxForm";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("NewTaxForm", () => {
  test("renders NewTaxForm component", async () => {
    const setShowTaxForm = jest.fn();

    render(<NewTaxForm setShowTaxForm={setShowTaxForm} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();

    expect(screen.getByText("New Tax - Step 1 of 2")).toBeInTheDocument();

    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByLabelText("Rate")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
