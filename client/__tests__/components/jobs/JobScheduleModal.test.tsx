import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleModal from "../../../components/jobs/JobScheduleModal";
import "@testing-library/jest-dom";

jest.mock("../../../services/actions/job", () => ({
  addJob: jest.fn(),
}));

describe("JobScheduleModal", () => {
  const setOpen = jest.fn();

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

  it("renders", async () => {
    render(
      <JobScheduleModal
        job={job}
        jobDayOfWeek={job.jobSchedule}
        dayOfWeek={3}
        open={true}
        setOpen={setOpen}
      />
    );

    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(screen.getByLabelText("9:00:00 AM-5:00:00 PM")).toBeInTheDocument();
  });
});
