import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSystemView from "../../../components/commuteSystem/CommuteSystemView";
import { CommuteStation } from "@/app/types/types";
import { usePathname } from "next/navigation";
import CommuteStationView from "../../../components/commuteStation/CommuteStationView";

// Mock usePathname from next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("CommuteStationView Component", () => {
  const commuteStation: CommuteStation = {
    id: 1,
    fromStation: "23 St",
    toStation: "14 St",
    tripDuration: 2,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  const mockSetCommuteStationModes = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/commute-systems");
  });

  it("renders the commute system's name", () => {
    render(
      <CommuteStationView
        commuteStation={commuteStation}
        setCommuteStationModes={mockSetCommuteStationModes}
      />
    );

    expect(screen.getByText("23 St")).toBeInTheDocument();
    expect(screen.getByText("14 St")).toBeInTheDocument();
    expect(screen.getByText("2 minute")).toBeInTheDocument();
    expect(screen.getByText("trip")).toBeInTheDocument();
  });
});
