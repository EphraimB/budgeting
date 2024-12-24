import { FareDetail, FullCommuteSchedule } from "@/app/types/types";
import GeneratedTicketView from "../../../components/commute/GeneratedTicketView";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("GeneratedTicketView Component", () => {
  const fare: FareDetail = {
    id: 1,
    accountId: 1,
    commuteSystemName: "NICE",
    name: "Regular",
    fromStation: "Cedarhurst Av",
    toStation: "Hempstead Av/Spruce St",
    tripDuration: 35,
    fare: 2.9,
    timeslots: [],
    alternateFareDetailId: null,
    duration: null,
    dayStart: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  const commuteSchedule: FullCommuteSchedule[] = [
    {
      dayOfWeek: 1,
      commuteSchedules: [
        {
          id: 1,
          fareId: 1,
          startTime: "09:00",
          endTime: "09:35",
          fare: 2.9,
          pass: "NICE Regular",
        },
      ],
    },
  ];

  it("renders the generated ticket", () => {
    render(
      <GeneratedTicketView fare={fare} commuteSchedule={commuteSchedule} />
    );

    expect(screen.getByText("NICE Regular")).toBeInTheDocument();
    expect(screen.getByText("Cedarhurst Av")).toBeInTheDocument();
    expect(screen.getByText("Hempstead Av/Spruce St")).toBeInTheDocument();
    expect(screen.getByText("$2.90 fare")).toBeInTheDocument();
  });
});
