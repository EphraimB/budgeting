import React from "react";
import { render, screen } from "@testing-library/react";
import NewJobForm from "../../../components/jobs/NewJobForm";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("../../../context/FeedbackContext", () => ({
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
    render(<NewJobForm setShowJobForm={setShowJobForm} accountId={1} />);

    expect(screen.getByText("Add Job")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Hourly Rate")).toBeInTheDocument();

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
