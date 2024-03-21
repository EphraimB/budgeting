import React from "react";
import { render, screen } from "@testing-library/react";
import JobsView from "../../components/JobsView";
import "@testing-library/jest-dom";

describe("JobsView", () => {
  const setJobModes = jest.fn();

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

  it("renders", () => {
    render(<JobsView job={job} setJobModes={setJobModes} account_id={1} />);

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Testing Inc.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You get paid $20 per hour, and you work 40 hours per week."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Click to view more details about this job."));
  });
});
