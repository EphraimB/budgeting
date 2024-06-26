import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollTaxEdit from "../../../components/payrollTaxes/PayrollTaxEdit";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { PayrollTax } from "@/app/types/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("PayrollTaxEdit", () => {
  it("renders PayrollTaxEdit form component", async () => {
    const payrollTax: PayrollTax = {
      id: 1,
      job_id: 1,
      name: "Social Security",
      rate: 0.02,
    };

    render(
      <PayrollTaxEdit
        job_id={1}
        payrollTax={payrollTax}
        setPayrollTaxModes={() => {}}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();

    expect(screen.getByText("Edit payroll tax")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toHaveValue("Social Security");

    expect(screen.getByLabelText("Payroll tax rate")).toHaveValue(2);

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
