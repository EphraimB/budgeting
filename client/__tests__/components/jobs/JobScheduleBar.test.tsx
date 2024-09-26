import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleBar from "../../../components/jobs/JobScheduleBar";
import "@testing-library/jest-dom";

jest.mock("dayjs", () => () => ({
  format: () => "09:00:00 AM",
}));

describe("JobScheduleBar", () => {
  const job = {
    id: 1,
    accountId: 1,
    name: "Test Job",
    hourlyRate: 16,
    totalHoursPerWeek: 32,
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
    render(<JobScheduleBar job={job.jobSchedule[0]} index={0} />);

    expect(
      screen.getByLabelText("09:00:00 AM-09:00:00 AM")
    ).toBeInTheDocument();
  });
});
