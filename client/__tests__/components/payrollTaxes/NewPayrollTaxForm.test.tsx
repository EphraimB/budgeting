import React from "react";
import { render, screen } from "@testing-library/react";
import NewPayrollTaxForm from "../../../components/payrollTaxes/NewPayrollTaxForm";
import "@testing-library/jest-dom";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/payrollTax", () => ({
  addPayrollTax: jest.fn(),
}));

describe("NewTaxForm", () => {
  test("renders NewPayrollTaxForm component", async () => {
    const setShowPayrollTaxesForm = jest.fn();

    render(
      <NewPayrollTaxForm
        jobId={1}
        setShowPayrollTaxesForm={setShowPayrollTaxesForm}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();

    expect(screen.getByText("Add payroll tax")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Payroll tax rate")).toBeInTheDocument();

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
