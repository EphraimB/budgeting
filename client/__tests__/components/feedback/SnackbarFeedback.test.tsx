import React from "react";
import { render, screen } from "@testing-library/react";
import SnackbarFeedback from "../../../components/feedback/SnackbarFeedback";
import "@testing-library/jest-dom";

jest.mock("../../context/FeedbackContext", () => ({
  useSnackbar: () => ({
    snackbar: { open: true, message: "Testing" },
    closeSnackbar: () => {},
  }),
}));

describe("Alerts", () => {
  it("renders a testing alert", () => {
    render(<SnackbarFeedback />);

    expect(screen.getByText("Testing")).toBeInTheDocument();
  });
});
