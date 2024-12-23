import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
          startTime: "00:00:00",
          endTime: "01:00:00",
          pass: "Test Fare",
        },
        {
          id: 2,
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
          id: 3,
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

    const fareWithValidTimeslot: FareDetail = {
      ...fare,
      timeslots: [
        {
          dayOfWeek: 1,
          startTime: "00:00:00",
          endTime: "01:00:00",
        },
      ],
    };

    render(
      <GeneratedTicketModal
        fare={fareWithValidTimeslot}
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
    await userEvent.click(mondayOption);

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

  it("disables Add to schedule button for duplicate schedule", async () => {
    const setOpen = jest.fn();

    // Simulate a situation where the start time is already occupied
    const fareWithDuplicateTime: FareDetail = {
      ...fare,
      timeslots: [
        {
          dayOfWeek: 0, // Sunday
          startTime: "00:00:00",
          endTime: "08:00:00",
        },
      ],
    };

    const commuteSchedule: FullCommuteSchedule[] = [
      {
        dayOfWeek: 0,
        commuteSchedules: [
          {
            id: 1,
            fareId: 1,
            fare: 2.9,
            startTime: "00:00:00",
            endTime: "01:00:00",
            pass: "Test Fare",
          },
        ],
      },
    ];

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

    // Ensure that Sunday is rendered and selectable
    const sundayOption = screen.getByText("Sunday");
    await userEvent.click(sundayOption);

    // Find the TimePicker input element
    const timePickerInput = screen.getByLabelText("Start Time");
    expect(timePickerInput).toBeInTheDocument();

    // The "Add to schedule" button should be disabled after setting a conflicting time
    const addButton = screen.getByText("Add to schedule");
    expect(addButton).toBeDisabled();

    // Check for the duplicate error message
    expect(
      screen.getByText("This schedule already exists.")
    ).toBeInTheDocument();
  });

  it("disables Add to schedule button for invalid fare time", async () => {
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
      screen.getByText("Fare not valid during this time.")
    ).toBeInTheDocument();
  });
});
