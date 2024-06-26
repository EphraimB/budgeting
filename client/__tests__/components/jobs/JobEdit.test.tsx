import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobEdit from "../../components/JobEdit";
import dayjs from "dayjs";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("JobEdit", () => {
  const setJobModes = jest.fn();

  it("renders the component", async () => {
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

    render(<JobEdit job={job} account_id={1} setJobModes={setJobModes} />);

    expect(screen.getByText("Edit Job - Step 1 of 2")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toHaveValue("Testing Inc.");
    expect(screen.getByLabelText("Hourly Rate")).toHaveValue("20");

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Job - Step 2 of 2")).toBeInTheDocument();

    expect(screen.getByLabelText("Vacation Days")).toHaveValue("10");
    expect(screen.getByLabelText("Sick Days")).toHaveValue("5");

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
