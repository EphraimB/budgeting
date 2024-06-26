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

describe("JobDetailsView", () => {
  const job = {
    id: 1,
    account_id: 1,
    name: "Testing Inc.",
    hourly_rate: 20,
    vacation_days: 10,
    sick_days: 5,
    total_hours_per_week: 40,
    job_schedule: [
      {
        job_id: 1,
        day_of_week: 1,
        start_time: "09:00:00",
        end_time: "17:00:00",
      },
    ],
  };

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

  const payroll_taxes: PayrollTax[] = [
    {
      id: 1,
      job_id: 1,
      name: "Social Security",
      rate: 0.02,
    },
    {
      id: 2,
      job_id: 1,
      name: "Medicare",
      rate: 0.01,
    },
  ];

  it("renders", () => {
    render(
      <JobDetailsView
        account_id={1}
        job={job}
        payroll_dates={payroll_dates}
        payroll_taxes={payroll_taxes}
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
