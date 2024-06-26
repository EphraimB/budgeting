import React from "react";
import { render, screen } from "@testing-library/react";
import JobDetailsView from "../../components/JobDetailsView";
import "@testing-library/jest-dom";

jest.mock("../../context/FeedbackContext", () => ({
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

  const payroll_dates = [
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

  it("renders", () => {
    render(<JobDetailsView job={job} payroll_dates={payroll_dates} />);

    expect(
      screen.getByText("Job Details for Testing Inc.")
    ).toBeInTheDocument();
  });
});
