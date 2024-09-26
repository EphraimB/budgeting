import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollTaxesView from "../../../components/payrollTaxes/PayrollTaxesView";
import "@testing-library/jest-dom";
import { PayrollTax } from "@/app/types/types";

describe("TaxView", () => {
  const setPayrollTaxModes = jest.fn();

  const payrollTax: PayrollTax = {
    id: 1,
    jobId: 1,
    name: "Social Security",
    rate: 0.02,
  };

  it("renders", () => {
    render(
      <PayrollTaxesView
        payrollTax={payrollTax}
        setPayrollTaxModes={setPayrollTaxModes}
      />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("This payroll tax rate is 2%")).toBeInTheDocument();
  });
});
