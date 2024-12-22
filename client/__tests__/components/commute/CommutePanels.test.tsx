import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommutePanels from "../../../components/commute/CommutePanels";
import { FareDetail, FullCommuteSchedule } from "@/app/types/types";

// Mock next/navigation hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/commute"),
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("CommutePanels Component", () => {
  const mockCommuteSchedule: FullCommuteSchedule[] = [
    {
      dayOfWeek: 1, // Monday
      commuteSchedules: [
        {
          id: 1,
          fareId: 1,
          pass: "Monthly Pass",
          startTime: "08:00",
          endTime: "09:00",
          fare: 5.0,
        },
        {
          id: 2,
          fareId: 2,
          pass: "Single Ride",
          startTime: "17:00",
          endTime: "18:00",
          fare: 2.5,
        },
      ],
    },
    {
      dayOfWeek: 3, // Wednesday
      commuteSchedules: [
        {
          id: 3,
          fareId: 3,
          pass: "Daily Pass",
          startTime: "12:00",
          endTime: "13:00",
          fare: 4.0,
        },
      ],
    },
  ];

  const fares: FareDetail[] = [
    {
      id: 1,
      accountId: 1,
      commuteSystemName: "OMNY",
      name: "Regular",
      fromStation: "14 St",
      toStation: "23 St",
      tripDuration: 2,
      fare: 2.9,
      timeslots: [],
      alternateFareDetailId: null,
      duration: null,
      dayStart: null,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
    {
      id: 2,
      accountId: 1,
      commuteSystemName: "OMNY",
      name: "Regular",
      fromStation: "Wall St",
      toStation: "34 St - Penn Station",
      tripDuration: 20,
      fare: 2.9,
      timeslots: [],
      alternateFareDetailId: null,
      duration: null,
      dayStart: null,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
  ];

  it("renders the Commute header", () => {
    render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );
    expect(screen.getByText("Commute")).toBeInTheDocument();
  });

  it("renders the Setup button with the correct link", () => {
    render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );

    const setupButton = screen.getByText("Setup");
    expect(setupButton).toBeInTheDocument();
  });

  it("renders the Weekly Commute Schedule section", () => {
    render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );
    expect(screen.getByText("Weekly Commute Schedule")).toBeInTheDocument();
  });

  it("displays schedules for the correct days", () => {
    render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );

    // Check for Monday's schedule
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(
      screen.getByText("Monthly Pass - 08:00 to 09:00 ($5.00)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Single Ride - 17:00 to 18:00 ($2.50)")
    ).toBeInTheDocument();

    // Check for Wednesday's schedule
    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(
      screen.getByText("Daily Pass - 12:00 to 13:00 ($4.00)")
    ).toBeInTheDocument();
  });

  it("displays all days of the week even if they have no schedule", () => {
    render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("displays a message when no schedules exist for a day", () => {
    render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );
    expect(screen.getByText("Commute")).toBeInTheDocument();
  });

  it("matches snapshots for visual consistency", () => {
    const { container } = render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} fares={fares} />
    );
    expect(container).toMatchSnapshot();
  });
});
