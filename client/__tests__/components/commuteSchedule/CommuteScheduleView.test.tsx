import { CommuteSchedule } from "@/app/types/types";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteScheduleView from "../../../components/commuteSchedule/CommuteScheduleView";

describe("CommuteScheduleView Component", () => {
  const commuteSchedule: CommuteSchedule = {
    id: 1,
    fareId: 1,
    startTime: "09:00",
    endTime: "09:35",
    fare: 2.9,
    pass: "NICE Regular",
  };

  it("should render the schedule view", () => {
    const setCommuteModes = jest.fn();

    render(
      <CommuteScheduleView
        commute={commuteSchedule}
        setCommuteModes={setCommuteModes}
      />
    );

    expect(
      screen.getByText("NICE Regular - 09:00 to 09:35 ($2.90)")
    ).toBeInTheDocument();
  });
});
