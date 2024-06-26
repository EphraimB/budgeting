import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleView from "../../components/jobs/JobScheduleView";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("dayjs", () => () => ({
  format: () => "09:00:00 AM",
}));

describe("JobScheduleView", () => {
  const job_day_of_week = [
    {
      job_id: 1,
      day_of_week: 1,
      start_time: "09:00:00",
      end_time: "17:00:00",
    },
  ];

  it("renders", async () => {
    render(
      <JobScheduleView
        job_day_of_week={job_day_of_week}
        day_of_week={1}
        handleOpenModal={() => {}}
      />
    );

    await userEvent.click(screen.getByTestId("job-schedule"));

    expect(
      screen.getByLabelText("09:00:00 AM-09:00:00 AM")
    ).toBeInTheDocument();
  });
});
