import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimeslotView from "../../../components/fareTimeslots/TimeslotView";
import { Timeslot } from "@/app/types/types"; // Adjust import path
import "@testing-library/jest-dom"; // Add this to enable matchers like toHaveStyle

// Mock data
const mockScheduleDayOfWeek: Timeslot[] = [
  { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
  { dayOfWeek: 1, startTime: "13:00", endTime: "17:00" },
];

const mockHandleOpenModal = jest.fn();

// In your test setup (e.g., beforeEach, beforeAll)
jest.mock("dayjs", () => {
  return jest.fn(() => ({
    format: () => "08:00", // Mock the format to return a fixed string
  }));
});

describe("TimeslotView Component", () => {
  it("renders the correct number of timeslots", () => {
    render(
      <TimeslotView
        scheduleDayOfWeek={mockScheduleDayOfWeek}
        dayOfWeek={1}
        handleOpenModal={mockHandleOpenModal}
      />
    );

    // Check if the correct number of timeslot boxes are rendered
    const timeslots = screen.getAllByTestId("job-schedule");
    expect(timeslots).toHaveLength(mockScheduleDayOfWeek.length);
  });

  it("positions the timeslots correctly based on start and end time", () => {
    render(
      <TimeslotView
        scheduleDayOfWeek={mockScheduleDayOfWeek}
        dayOfWeek={1}
        handleOpenModal={mockHandleOpenModal}
      />
    );

    // Verify the timeslots are positioned correctly using the time-to-percent logic
    const firstTimeslot = screen.getAllByTestId("job-schedule")[0];
    const secondTimeslot = screen.getAllByTestId("job-schedule")[1];

    // Check if first timeslot is positioned correctly based on its start time (08:00)
    expect(firstTimeslot).toHaveStyle("left: 33.33333333333333%"); // 8:00 is 33.33% of the day (1440 minutes)
    expect(firstTimeslot).toHaveStyle("width: 16.66666666666667%"); // Width based on 12:00

    // Check if second timeslot is positioned correctly based on its start time (13:00)
    expect(secondTimeslot).toHaveStyle("left: 54.166666666666664%"); // 13:00 is 54.17% of the day (780 minutes)
    expect(secondTimeslot).toHaveStyle("width: 16.66666666666668%"); // Width based on 17:00
  });

  it("displays correct tooltip text in 24-hour format", () => {
    render(
      <TimeslotView
        scheduleDayOfWeek={mockScheduleDayOfWeek}
        dayOfWeek={1}
        handleOpenModal={mockHandleOpenModal}
      />
    );

    // Check the tooltip text of the first timeslot (08:00 - 12:00)
    const firstTimeslot = screen.getAllByTestId("job-schedule")[0];
    userEvent.hover(firstTimeslot);

    expect(screen.getAllByLabelText("08:00-08:00")[0]).toBeInTheDocument(); // In 24-hour format
  });
});
