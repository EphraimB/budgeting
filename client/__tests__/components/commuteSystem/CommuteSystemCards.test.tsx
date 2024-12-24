import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSystemCards from "../../../components/commuteSystem/CommuteSystemCards";
import { CommuteSystem } from "@/app/types/types";

jest.mock("../../../services/actions/commuteSystem", () => ({
  editCommuteSystem: jest.fn(),
}));

describe("CommuteSystemCards Component", () => {
  const commuteSystems: CommuteSystem[] = [
    {
      id: 1,
      name: "Bus System",
      fareCap: null,
      fareCapDuration: null,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
    {
      id: 2,
      name: "Train System",
      fareCap: 33,
      fareCapDuration: 1,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
  ];

  it("renders commute systems", () => {
    render(<CommuteSystemCards commuteSystems={commuteSystems} />);

    expect(screen.getByTestId("add-fab"));
  });
});
