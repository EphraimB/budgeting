import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommutePanels from "../../../components/commute/CommutePanels";
import { FullCommuteSchedule } from "@/app/types/types";
import userEvent from "@testing-library/user-event";

// Mock next/navigation hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/commute"),
}));

describe("CommutePanels Component", () => {
  const mockCommuteSchedule: FullCommuteSchedule[] = [
    {
      dayOfWeek: 1, // Monday
      commuteSchedules: [
        {
          id: 1,
          pass: "Monthly Pass",
          startTime: "08:00",
          endTime: "09:00",
          fare: 5.0,
        },
        {
          id: 2,
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
          pass: "Daily Pass",
          startTime: "12:00",
          endTime: "13:00",
          fare: 4.0,
        },
      ],
    },
  ];

  it("renders the Commute header", () => {
    render(<CommutePanels commuteSchedule={mockCommuteSchedule} />);
    expect(screen.getByText("Commute")).toBeInTheDocument();
  });

  it("renders the Setup button with the correct link", () => {
    render(<CommutePanels commuteSchedule={mockCommuteSchedule} />);
    const setupButton = screen.getByRole("button", { name: /setup/i });
    expect(setupButton).toBeInTheDocument();
    expect(setupButton.closest("a")).toHaveAttribute("href", "/commute/setup");
  });

  it("renders the Weekly Commute Schedule section", () => {
    render(<CommutePanels commuteSchedule={mockCommuteSchedule} />);
    expect(screen.getByText("Weekly Commute Schedule")).toBeInTheDocument();
  });

  it("displays schedules for the correct days", () => {
    render(<CommutePanels commuteSchedule={mockCommuteSchedule} />);

    // Check for Monday's schedule
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(
      screen.getByText("Monthly Pass - 08:00 to 09:00 ($5)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Single Ride - 17:00 to 18:00 ($2.5)")
    ).toBeInTheDocument();

    // Check for Wednesday's schedule
    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(
      screen.getByText("Daily Pass - 12:00 to 13:00 ($4)")
    ).toBeInTheDocument();
  });

  it("displays all days of the week even if they have no schedule", () => {
    render(<CommutePanels commuteSchedule={mockCommuteSchedule} />);
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
    render(<CommutePanels commuteSchedule={mockCommuteSchedule} />);
    expect(
      screen.getByText("Tickets will generate based on the setup")
    ).toBeInTheDocument();
  });

  it("matches snapshots for visual consistency", () => {
    const { container } = render(
      <CommutePanels commuteSchedule={mockCommuteSchedule} />
    );
    expect(container).toMatchSnapshot();
  });
});
