import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleBar from "../../components/JobScheduleBar";
import "@testing-library/jest-dom";

jest.mock("dayjs", () => () => ({
  format: () => "09:00:00 AM",
}));

describe("JobScheduleBar", () => {
  const job = {
    id: 1,
    account_id: 1,
    name: "Test Job",
    hourly_rate: 16,
    vacation_days: 10,
    sick_days: 5,
    total_hours_per_week: 32,
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
    render(<JobScheduleBar job={job.job_schedule[0]} index={0} />);

    expect(
      screen.getByLabelText("09:00:00 AM-09:00:00 AM")
    ).toBeInTheDocument();
  });
});
