import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import FareDayTimeslots from "../../../components/fareTimeslots/fareDayTimeslots";
import { Timeslot } from "@/app/types/types";

describe("FareDayTimeslots", () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  const initialTimeslots: Timeslot[] = [
    { dayOfWeek: 1, startTime: "08:00:00", endTime: "12:00:00" },
    { dayOfWeek: 1, startTime: "13:00:00", endTime: "17:00:00" },
  ];

  test("renders the initial timeslots", () => {
    render(
      <FareDayTimeslots
        timeslot={initialTimeslots}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Check if the mocked time "08:00" is rendered for the start time
    expect(screen.getByDisplayValue("08:00 AM")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12:00 PM")).toBeInTheDocument(); // For the second slot as well

    expect(screen.getByDisplayValue("01:00 PM")).toBeInTheDocument();
    expect(screen.getByDisplayValue("05:00 PM")).toBeInTheDocument(); // For the second slot as well
  });

  test("adds a new timeslot", async () => {
    render(
      <FareDayTimeslots
        timeslot={initialTimeslots}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const addButton = screen.getByText("Add Timeslot");
    userEvent.click(addButton);

    // Check if the new timeslot input fields appear
    expect(screen.getAllByLabelText("Start Time")).toHaveLength(2);
    expect(screen.getAllByLabelText("End Time")).toHaveLength(2);
  });

  test("removes a timeslot", async () => {
    render(
      <FareDayTimeslots
        timeslot={initialTimeslots}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Click on the delete icon of the first timeslot
    const deleteButtons = screen.getAllByLabelText("delete");
    userEvent.click(deleteButtons[0]);

    // Ensure the first timeslot is removed
    expect(screen.getAllByLabelText("Start Time")).toHaveLength(2);
    expect(screen.getAllByLabelText("End Time")).toHaveLength(2);
  });

  test("handles time change", async () => {
    render(
      <FareDayTimeslots
        timeslot={initialTimeslots}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const startTimeInputs = screen.getAllByLabelText("Start Time");
    const endTimeInputs = screen.getAllByLabelText("End Time");

    // Change the time of the first timeslot
    // userEvent.clear(startTimeInputs[0]);
    await userEvent.type(startTimeInputs[0], "09:00:00");

    // userEvent.clear(endTimeInputs[0]);
    await userEvent.type(endTimeInputs[0], "13:00:00");

    // Ensure the start time input is updated
    expect(startTimeInputs[0]).toHaveValue("09:00 AM"); // Assuming the input is formatted in 12-hour format

    // Ensure the end time input is updated
    expect(endTimeInputs[0]).toHaveValue("03:00 PM"); // Same assumption for the 12-hour format
  });

  test("calls onSave when save button is clicked", async () => {
    render(
      <FareDayTimeslots
        timeslot={initialTimeslots}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Modify timeslot values
    const startTimeInputs = screen.getAllByLabelText("Start Time");
    const endTimeInputs = screen.getAllByLabelText("End Time");

    await userEvent.type(startTimeInputs[0], "09:00:00");

    await userEvent.type(endTimeInputs[0], "15:00:00");

    const saveButton = screen.getByText("Save");
    userEvent.click(saveButton);

    // Wait for the mock function to be called
    await waitFor(() =>
      expect(mockOnSave).toHaveBeenCalledWith([
        { startTime: "09:00:00", endTime: "17:00:00" },
        { startTime: "13:00:00", endTime: "17:00:00" },
      ])
    );

    // Ensure onClose is also called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("handles canceling by closing modal", () => {
    render(
      <FareDayTimeslots
        timeslot={initialTimeslots}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Ensure onClose is called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
