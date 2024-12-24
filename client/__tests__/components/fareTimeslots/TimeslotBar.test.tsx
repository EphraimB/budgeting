import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TimeslotBar from "../../../components/fareTimeslots/TimeslotBar";
import { Timeslot } from "@/app/types/types"; // Ensure this import matches your project

// Example of mock Timeslot data
const mockTimeslot: Timeslot = {
  dayOfWeek: 1,
  startTime: "08:00:00",
  endTime: "12:00:00",
};

test("renders tooltip with formatted time correctly", async () => {
  render(<TimeslotBar timeslot={mockTimeslot} index={0} />);

  const tooltipElement = screen.getByLabelText("8:00:00 AM-12:00:00 PM");
  expect(tooltipElement).toBeInTheDocument();
});

test("calculates and sets correct width and position", () => {
  render(<TimeslotBar timeslot={mockTimeslot} index={0} />);

  const timeslotBox = screen.getByTestId("timeslot-box");
  const startPercentage = ((8 * 60) / 1440) * 100; // For 08:00:00 -> should be ~33.33%
  const endPercentage = ((12 * 60) / 1440) * 100; // For 12:00:00 -> should be ~50%

  // Check if the Box is positioned correctly
  expect(timeslotBox).toHaveStyle(`left: ${startPercentage}%`);
  expect(timeslotBox).toHaveStyle(`width: ${endPercentage - startPercentage}%`);
});

test("shows tooltip on hover", async () => {
  render(<TimeslotBar timeslot={mockTimeslot} index={0} />);

  const timeslotBox = screen.getByTestId("timeslot-box");
  fireEvent.mouseEnter(timeslotBox);

  // Ensure the tooltip is visible after hover
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip).toBeInTheDocument();
});
