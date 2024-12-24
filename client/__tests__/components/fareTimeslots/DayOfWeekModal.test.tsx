import { render, screen } from "@testing-library/react";
import DayOfWeekModal from "../../../components/fareTimeslots/DayOfWeekModal";
import { FareDetail, Timeslot } from "@/app/types/types";
import "@testing-library/jest-dom";

// Mock the external dependencies (such as editFareDetail)
jest.mock("../../../services/actions/fareDetail", () => ({
  editFareDetail: jest.fn(),
}));

interface DayOfWeekTimeslot {
  startTime: string;
  endTime: string;
}

// Mock the FareDayTimeslots component
jest.mock("../../../components/fareTimeslots/fareDayTimeslots", () => ({
  __esModule: true,
  default: ({
    onSave,
    onClose,
  }: {
    onSave: (time: DayOfWeekTimeslot[]) => void;
    onClose: () => void;
  }) => (
    <div>
      <button
        onClick={() => onSave([{ startTime: "08:00", endTime: "12:00" }])}
      >
        Save Timeslot
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("DayOfWeekModal", () => {
  const mockSetOpen = jest.fn();

  const fareDetail: FareDetail = {
    id: 1,
    accountId: 1,
    commuteSystemId: 1,
    commuteSystemName: "OMNY",
    stationId: 1,
    name: "Regular",
    fare: 10,
    timeslots: [
      { dayOfWeek: 0, startTime: "08:00", endTime: "12:00" },
      { dayOfWeek: 1, startTime: "10:00", endTime: "14:00" },
    ],
    alternateFareDetailId: null,
    duration: null,
    dayStart: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  const scheduleDayOfWeek: Timeslot[] = [
    { dayOfWeek: 0, startTime: "08:00", endTime: "12:00" },
  ];

  it("renders and opens the modal", () => {
    render(
      <DayOfWeekModal
        accountId={1}
        stationId={1}
        fareDetail={fareDetail}
        scheduleDayOfWeek={scheduleDayOfWeek}
        dayOfWeek={0}
        open={true}
        setOpen={mockSetOpen}
      />
    );

    expect(screen.getByText("Sunday")).toBeInTheDocument();
    expect(screen.getByText("Save Timeslot")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("does not render modal when open is false", () => {
    render(
      <DayOfWeekModal
        accountId={1}
        stationId={1}
        fareDetail={fareDetail}
        scheduleDayOfWeek={scheduleDayOfWeek}
        dayOfWeek={0}
        open={false}
        setOpen={mockSetOpen}
      />
    );

    // Ensure that modal content is not in the document
    expect(screen.queryByText("Sunday")).not.toBeInTheDocument();
  });
});
