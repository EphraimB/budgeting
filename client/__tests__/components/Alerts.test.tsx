import React from "react";
import { render, screen } from "@testing-library/react";
import Alerts from "../../components/Alerts";
import "@testing-library/jest-dom";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    alert: { open: true, severity: "error", message: "Testing" },
    closeAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("Alerts", () => {
  it("renders a testing alert", () => {
    jest.mock("../../context/FeedbackContext", () => ({
      useAlert: () => ({
        alert: { open: true, severity: "error", message: "Testing" },
        closeAlert: () => {},
      }),
      useSnackbar: () => ({
        showSnackbar: () => {},
      }),
    }));

    render(<Alerts />);

    expect(screen.getByText("Testing")).toBeInTheDocument();
  });
});
