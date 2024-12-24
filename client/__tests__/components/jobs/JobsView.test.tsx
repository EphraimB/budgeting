import React from "react";
import { render, screen } from "@testing-library/react";
import JobsView from "../../../components/jobs/JobsView";
import "@testing-library/jest-dom";

describe("JobsView", () => {
  const setJobModes = jest.fn();

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

  it("renders", () => {
    render(<JobsView job={job} setJobModes={setJobModes} accountId={1} />);

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Testing Inc.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You get paid $20.00 per hour, and you work 40 hours per week."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Click to view more details about this job."));
  });
});
