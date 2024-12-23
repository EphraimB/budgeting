import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareDetailView from "../../../components/fareDetails/FareDetailView";
import { FareDetail } from "@/app/types/types";
import { usePathname } from "next/navigation";

// Mock usePathname from next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("FareDetailsView Component", () => {
  const fareDetail: FareDetail = {
    id: 1,
    accountId: 1,
    commuteSystemName: "OMNY",
    name: "Bus System",
    fromStation: "Cedarhurst Av",
    toStation: "Hempstead Av/Spruce St",
    tripDuration: 35,
    fare: 2.76,
    timeslots: [],
    alternateFareDetailId: null,
    duration: null,
    dayStart: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  const mockSetFareDetailModes = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/commute-systems");
  });

  it("renders the commute system's name", () => {
    render(
      <FareDetailView
        fareDetail={fareDetail}
        setFareDetailModes={mockSetFareDetailModes}
      />
    );

    expect(screen.getByText("Bus System")).toBeInTheDocument();
    expect(screen.getByText("$2.76")).toBeInTheDocument();
  });
});
