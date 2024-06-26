import React from "react";
import { render, screen } from "@testing-library/react";
import NewJobForm from "../../../components/jobs/NewJobForm";
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

describe("NewJobForm", () => {
  const setShowJobForm = jest.fn();

  it("renders", async () => {
    render(<NewJobForm setShowJobForm={setShowJobForm} account_id={1} />);

    expect(screen.getByText("Add Job - Step 1 of 2")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Hourly Rate")).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Add Job - Step 2 of 2")).toBeInTheDocument();

    expect(screen.getByLabelText("Vacation Days")).toBeInTheDocument();
    expect(screen.getByLabelText("Sick Days")).toBeInTheDocument();

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
