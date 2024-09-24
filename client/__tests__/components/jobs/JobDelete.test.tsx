import React from "react";
import { render, screen } from "@testing-library/react";
import JobDelete from "../../../components/jobs/JobDelete";
import "@testing-library/jest-dom";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("JobDelete", () => {
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
    render(<JobDelete job={job} setJobModes={setJobModes} />);

    expect(screen.getByText('Delete "Testing Inc."?')).toBeInTheDocument();

    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
