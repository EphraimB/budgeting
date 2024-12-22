import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSystemView from "../../../components/commuteSystem/CommuteSystemView";
import { CommuteSystem } from "@/app/types/types";
import { usePathname } from "next/navigation";

// Mock usePathname from next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("CommuteSystemView Component", () => {
  const mockCommuteSystem: CommuteSystem = {
    id: 1,
    name: "Bus System",
    fareCap: 50,
    fareCapDuration: 1, // Weekly fare cap
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  const mockSetCommuteSystemModes = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/commute-systems");
  });

  it("renders the commute system's name", () => {
    render(
      <CommuteSystemView
        commuteSystem={mockCommuteSystem}
        setCommuteSystemModes={mockSetCommuteSystemModes}
      />
    );

    expect(screen.getByText("Bus System")).toBeInTheDocument();
  });

  it("renders the correct fare cap information", () => {
    render(
      <CommuteSystemView
        commuteSystem={mockCommuteSystem}
        setCommuteSystemModes={mockSetCommuteSystemModes}
      />
    );

    expect(
      screen.getByText("There's a fare cap of $50.00 per week for this system")
    ).toBeInTheDocument();
  });

  it("renders 'no fare cap' when fareCap is undefined", () => {
    const systemWithoutFareCap = { ...mockCommuteSystem, fareCap: null };

    render(
      <CommuteSystemView
        commuteSystem={systemWithoutFareCap}
        setCommuteSystemModes={mockSetCommuteSystemModes}
      />
    );

    expect(
      screen.getByText("There's no fare cap for this system")
    ).toBeInTheDocument();
  });
});
