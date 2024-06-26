import React from "react";
import { render, screen } from "@testing-library/react";
import Alerts from "../../../components/feedback/Alerts";
import "@testing-library/jest-dom";

jest.mock("../../../context/FeedbackContext", () => ({
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
    render(<Alerts />);

    expect(screen.getByText("Testing")).toBeInTheDocument();
  });
});
