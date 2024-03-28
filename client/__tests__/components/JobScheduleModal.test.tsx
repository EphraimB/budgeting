import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleModal from "../../components/JobScheduleModal";
import "@testing-library/jest-dom";

describe("JobScheduleModal", () => {
  const setOpen = jest.fn();

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

  it("renders", async () => {
    render(
      <JobScheduleModal
        job={job}
        job_day_of_week={job.job_schedule}
        day_of_week={3}
        open={true}
        setOpen={setOpen}
      />
    );

    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(screen.getByLabelText("9:00:00 AM-5:00:00 PM")).toBeInTheDocument();
  });
});
