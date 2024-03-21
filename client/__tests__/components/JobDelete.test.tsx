import React from "react";
import { render, screen } from "@testing-library/react";
import JobDelete from "../../components/JobDelete";
import "@testing-library/jest-dom";

jest.mock("../../context/FeedbackContext", () => ({
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
    account_id: 1,
    name: "Testing Inc.",
    hourly_rate: 20,
    vacation_days: 10,
    sick_days: 5,
    total_hours_per_week: 40,
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
    render(<JobDelete job={job} setJobModes={setJobModes} />);

    expect(screen.getByText('Delete "Testing Inc."?')).toBeInTheDocument();

    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
