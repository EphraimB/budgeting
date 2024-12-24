import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteStationCards from "../../../components/commuteStation/CommuteStationsCards";
import { CommuteStation } from "@/app/types/types";

describe("CommuteStationCards Component", () => {
  const commuteStations: CommuteStation[] = [
    {
      id: 1,
      fromStation: "23 St",
      toStation: "14 St",
      tripDuration: 2,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
    {
      id: 2,
      fromStation: "18 Av",
      toStation: "Wall St",
      tripDuration: 30,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
  ];

  it("renders commute stations", () => {
    render(
      <CommuteStationCards
        commuteSystemId={1}
        commuteStations={commuteStations}
      />
    );

    expect(screen.getByTestId("add-fab"));
  });
});
