import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import JobEdit from "../../../components/jobs/JobEdit";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../context/FeedbackContext", () => ({
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

    render(<JobEdit job={job} accountId={1} setJobModes={setJobModes} />);

    expect(screen.getByText("Edit Job")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toHaveValue("Testing Inc.");
    expect(screen.getByLabelText("Hourly Rate")).toHaveValue("20");

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
