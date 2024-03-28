import React from "react";
import { render, screen } from "@testing-library/react";
import JobDayTimeslots from "../../components/JobDayTimeslots";
import "@testing-library/jest-dom";

describe("JobDayTimeslots", () => {
  const onSave = jest.fn();
  const onClose = jest.fn();

  const job_schedule = [
    {
      job_id: 1,
      day_of_week: 1,
      start_time: "09:00:00",
      end_time: "17:00:00",
    },
  ];

  it("renders", async () => {
    render(
      <JobDayTimeslots
        job_schedule={job_schedule}
        onSave={onSave}
        onClose={onClose}
      />
    );

    expect(screen.getByLabelText("Start Time")).toBeInTheDocument();
    expect(screen.getByLabelText("End Time")).toBeInTheDocument();
    expect(screen.getByText("Add Timeslot")).toBeInTheDocument();
  });
});
