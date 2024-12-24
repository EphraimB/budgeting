import React from "react";
import { render, screen } from "@testing-library/react";
import JobDetailsView from "../../../components/jobs/JobDetailsView";
import "@testing-library/jest-dom";
import { PayrollDate, PayrollTax } from "@/app/types/types";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    alert: { open: true, severity: "error", message: "Testing" },
    closeAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/job", () => ({
  editJob: jest.fn(),
}));

describe("JobDetailsView", () => {
  const job = {
    id: 1,
    accountId: 1,
    name: "Testing Inc.",
    hourlyRate: 20,
    totalHoursPerWeek: 40,
    jobSchedule: [
      {
        jobId: 1,
        dayOfWeek: 1,
        startTime: "09:00:00",
        endTime: "17:00:00",
      },
    ],
  };

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

  const payrollTaxes: PayrollTax[] = [
    {
      id: 1,
      jobId: 1,
      name: "Social Security",
      rate: 0.02,
    },
    {
      id: 2,
      jobId: 1,
      name: "Medicare",
      rate: 0.01,
    },
  ];

  it("renders", () => {
    render(
      <JobDetailsView
        accountId={1}
        job={job}
        payrollDates={payrollDates}
        payrollTaxes={payrollTaxes}
      />
    );

    expect(
      screen.getByText("Job Details for Testing Inc.")
    ).toBeInTheDocument();

    expect(screen.getByText("Payroll dates")).toBeInTheDocument();
    expect(screen.getByText("You get paid on the 15th and 31st of the month"));

    expect(screen.getByText("Payroll taxes")).toBeInTheDocument();
    expect(
      screen.getByText("All 2 of your payroll taxes take 3% of your payroll")
    );
  });
});
