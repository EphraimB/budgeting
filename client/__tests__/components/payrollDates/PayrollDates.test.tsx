import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollDates from "../../../components/payrollDates/PayrollDates";
import "@testing-library/jest-dom";
import { Job, PayrollDate } from "@/app/types/types";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    alert: () => {},
    closeAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("PayrollDates", () => {
  const payrollDates: PayrollDate[] = [
    {
      id: 1,
      jobId: 1,
      payrollDay: 15,
    },
    {
      id: 2,
      jobId: 1,
      payrollDay: 31,
    },
  ];

  const job: Job = {
    id: 1,
    accountId: 1,
    name: "Personal",
    hourlyRate: 16,
    totalHoursPerWeek: 8,
    jobSchedule: [],
  };

  it("renders correct number of PayrollDateCards", () => {
    render(<PayrollDates job={job} payrollDates={payrollDates} />);
    expect(screen.getByText("Payroll dates for Personal"));
    expect(screen.getAllByTestId("payroll-date-card")).toHaveLength(31);
  });
});
