import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollDates from "../../../components/payrollDates/PayrollDates";
import "@testing-library/jest-dom";
import { Job, PayrollDate } from "@/app/types/types";

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

  const job: Job = {
    id: 1,
    account_id: 1,
    name: "personal",
    hourly_rate: 16,
    vacation_days: 15,
    sick_days: 15,
    total_hours_per_week: 8,
    job_schedule: [],
  };

  it("renders correct number of PayrollDateCards", () => {
    render(<PayrollDates job={job} payroll_dates={payroll_dates} />);
    expect(screen.getAllByTestId("payroll-date-card")).toHaveLength(31);
  });
});
