import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareDetailsCards from "../../../components/fareDetails/FareDetailsCards";
import { FareDetail } from "@/app/types/types";

describe("FareDetailsCards Component", () => {
  const fareDetails: FareDetail[] = [
    {
      id: 1,
      accountId: 1,
      commuteSystemName: "OMNY",
      name: "Bus System",
      fromStation: "Hempstead Transit Center",
      toStation: "Cedarhurst",
      tripDuration: 46,
      fare: 2.76,
      timeslots: [],
      alternateFareDetailId: null,
      duration: null,
      dayStart: null,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
  ];

  it("renders commute systems", () => {
    render(
      <FareDetailsCards
        accountId={1}
        commuteSystemId={1}
        commuteStationId={1}
        fareDetails={fareDetails}
      />
    );

    expect(screen.getByTestId("add-fab"));
  });
});
