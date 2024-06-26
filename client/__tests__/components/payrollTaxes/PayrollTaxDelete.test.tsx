import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PayrollTaxDelete from "../../../components/payrollTaxes/PayrollTaxDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("PayrollTaxDelete", () => {
  it("renders the component", () => {
    const payrollTax = {
      id: 1,
      job_id: 1,
      name: "Social Security",
      rate: 0.02,
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(
      <PayrollTaxDelete payrollTax={payrollTax} setPayrollTaxModes={() => {}} />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Social Security"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
