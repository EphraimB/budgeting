import React from "react";
import { render, screen } from "@testing-library/react";
import JobScheduleDayView from "../../../components/jobs/JobScheduleDayView";
import "@testing-library/jest-dom";

jest.mock("../../../services/actions/job", () => ({
  addJob: jest.fn(),
}));

describe("JobScheduleDayView", () => {
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
    render(<JobScheduleDayView job={job} />);

    expect(screen.getByText("Sunday")).toBeInTheDocument();
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(screen.getByText("Thursday")).toBeInTheDocument();
    expect(screen.getByText("Friday")).toBeInTheDocument();
    expect(screen.getByText("Saturday")).toBeInTheDocument();
  });
});
