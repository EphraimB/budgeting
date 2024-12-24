import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareTimeslotsDayView from "../../../components/fareTimeslots/FareTimeslotsDayView";
import { FareDetail } from "@/app/types/types";

jest.mock("../../../services/actions/fareDetail", () => ({
  addFareDetail: jest.fn(),
}));

describe("FareTimeslotsDayView Component", () => {
  const fareDetail: FareDetail = {
    id: 1,
    accountId: 1,
    commuteSystemName: "OMNY",
    name: "Bus System",
    fromStation: "23 St",
    toStation: "14 St",
    tripDuration: 2,
    fare: 2.76,
    timeslots: [],
    alternateFareDetailId: null,
    duration: null,
    dayStart: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  it("renders the days of the week", () => {
    render(
      <FareTimeslotsDayView
        accountId={1}
        commuteSystemId={1}
        stationId={1}
        fareDetail={fareDetail}
      />
    );
    expect(screen.getByText("Sunday")).toBeInTheDocument();
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(screen.getByText("Thursday")).toBeInTheDocument();
    expect(screen.getByText("Friday")).toBeInTheDocument();
    expect(screen.getByText("Saturday")).toBeInTheDocument();
  });
});
