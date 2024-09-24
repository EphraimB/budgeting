import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleView from "../../../components/jobs/JobScheduleView";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("dayjs", () => () => ({
  format: () => "09:00:00 AM",
}));

describe("JobScheduleView", () => {
  const jobDayOfWeek = [
    {
      jobId: 1,
      dayOfWeek: 1,
      startTime: "09:00:00",
      endTime: "17:00:00",
    },
  ];

  it("renders", async () => {
    render(
      <JobScheduleView
        jobDayOfWeek={jobDayOfWeek}
        dayOfWeek={1}
        handleOpenModal={() => {}}
      />
    );

    await userEvent.click(screen.getByTestId("job-schedule"));

    expect(
      screen.getByLabelText("09:00:00 AM-09:00:00 AM")
    ).toBeInTheDocument();
  });
});
