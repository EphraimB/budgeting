import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import GeneratedTicketModal from "../../../components/commute/GeneratedTicketModal";
import { FareDetail, FullCommuteSchedule } from "@/app/types/types";

// Mocks for context and service functions
jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("GeneratedTicketModal", () => {
  const fare: FareDetail = {
    id: 1,
    accountId: 1,
    name: "Test Fare",
    fromStation: "23 St",
    toStation: "34 St - Penn Station",
    commuteSystemName: "Test System",
    fare: 5.0,
    tripDuration: 30, // trip duration in minutes
    timeslots: [
      {
        dayOfWeek: 0,
        startTime: "06:00:00",
        endTime: "08:00:00",
      },
      {
        dayOfWeek: 1,
        startTime: "06:00:00",
        endTime: "08:00:00",
      },
    ],
    alternateFareDetailId: null,
    duration: null,
    dayStart: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  const commuteSchedule: FullCommuteSchedule[] = [
    {
      dayOfWeek: 0,
      commuteSchedules: [
        {
          id: 1,
          fareId: 1,
          fare: 2.9,
          startTime: "06:30:00",
          endTime: "07:00:00",
          pass: "Test Fare",
        },
      ],
    },
    {
      dayOfWeek: 1,
      commuteSchedules: [
        {
          id: 1,
          fareId: 1,
          fare: 2.9,
          startTime: "06:30:00",
          endTime: "07:00:00",
          pass: "Test Fare",
        },
      ],
    },
  ];

  it("renders and allows interaction", async () => {
    const setOpen = jest.fn();

    render(
      <GeneratedTicketModal
        fare={fare}
        commuteSchedule={commuteSchedule}
        open={true}
        setOpen={setOpen}
      />
    );

    // Check modal title and fare details
    expect(screen.getByText("Test System Test Fare")).toBeInTheDocument();
    expect(screen.getByText("$5.00 fare")).toBeInTheDocument();

    // Get the select element (combobox role)
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    // Open the select dropdown by clicking the select element
    await userEvent.click(selectElement);

    // Click on the "Monday" option (index 1)
    const mondayOption = screen.getByText("Monday");
    userEvent.click(mondayOption);

    // Check that the TimePicker is rendered and functional
    expect(screen.getByLabelText("Start Time")).toBeInTheDocument();
    const timePickerInput = screen.getByLabelText("Start Time");
    await userEvent.click(timePickerInput);
    const startTime = "07:00:00";
    userEvent.type(timePickerInput, startTime);

    // Check that "Add to schedule" button is enabled and clickable
    const addButton = screen.getByText("Add to schedule");
    expect(addButton).toBeEnabled();

    userEvent.click(addButton);
  });

  it("disables Add to schedule button for duplicate timeslot", async () => {
    const setOpen = jest.fn();

    // Simulate a situation where the start time is already occupied
    const fareWithDuplicateTime: FareDetail = {
      ...fare,
      timeslots: [
        {
          dayOfWeek: 0,
          startTime: "06:00:00",
          endTime: "08:00:00",
        },
      ],
    };

    render(
      <GeneratedTicketModal
        fare={fareWithDuplicateTime}
        commuteSchedule={commuteSchedule}
        open={true}
        setOpen={setOpen}
      />
    );

    // Get the select element (combobox role)
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    // Click on the "Sunday" option (index 0)
    const sundayOption = screen.getByText("Sunday");
    await userEvent.click(sundayOption);

    // Ensure that the TimePicker input is rendered and clickable
    const timePickerInput = screen.getByLabelText("Start Time");
    expect(timePickerInput).toBeInTheDocument();

    // Click the input field to open the TimePicker
    await userEvent.click(timePickerInput);

    // Type the time in HH:mm:ss format (e.g., "06:30:00")
    const startTime = "06:30:00";
    userEvent.type(timePickerInput, startTime);

    // Check that the time has been set correctly
    expect(timePickerInput).toHaveValue("06:30 AM");

    // The "Add to schedule" button should be disabled
    const addButton = screen.getByText("Add to schedule");
    expect(addButton).toBeDisabled();
    expect(
      screen.getByText("This schedule already exists.")
    ).toBeInTheDocument();
  });

  it("shows alert for invalid time selection", async () => {
    const setOpen = jest.fn();

    const fareWithInvalidTimeslot: FareDetail = {
      ...fare,
      timeslots: [
        {
          dayOfWeek: 1,
          startTime: "06:00:00",
          endTime: "08:00:00",
        },
      ],
    };

    render(
      <GeneratedTicketModal
        fare={fareWithInvalidTimeslot}
        commuteSchedule={commuteSchedule}
        open={true}
        setOpen={setOpen}
      />
    );

    // Get the select element (combobox role)
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    // Open the select dropdown by clicking the select element
    await userEvent.click(selectElement);

    // Click on the "Tuesday" option (index 1)
    const tuesdayOption = screen.getByText("Tuesday");
    userEvent.click(tuesdayOption);

    // Select an invalid time (outside of the valid timeslot range)
    const timePickerInput = screen.getByLabelText("Start Time");
    await userEvent.click(timePickerInput);
    userEvent.type(timePickerInput, "10:00:00"); // Invalid time outside valid slot

    // The button should be disabled and an error message should be shown
    const addButton = screen.getByText("Add to schedule");
    expect(addButton).toBeDisabled();
    expect(
      screen.getByText("No valid times available for this day.")
    ).toBeInTheDocument();
  });
});
