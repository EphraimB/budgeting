import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollDates from "../../components/payrollDates/PayrollDates";
import "@testing-library/jest-dom";
import { PayrollDate } from "@/app/types/types";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    alert: () => {},
    closeAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("PayrollDates", () => {
  const payroll_dates: PayrollDate[] = [
    {
      id: 1,
      job_id: 1,
      payroll_day: 15,
    },
    {
      id: 2,
      job_id: 1,
      payroll_day: 31,
    },
  ];

  it("renders correct number of PayrollDateCards", () => {
    render(<PayrollDates job_id={1} payroll_dates={payroll_dates} />);
    expect(screen.getAllByTestId("payroll-date-card")).toHaveLength(31);
  });
});
