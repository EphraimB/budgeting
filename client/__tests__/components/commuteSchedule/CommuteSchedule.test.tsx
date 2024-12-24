import { FullCommuteSchedule } from "@/app/types/types";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSchedule from "../../../components/commuteSchedule/CommuteSchedule";

describe("CommuteSchedule Component", () => {
  const commuteSchedule: FullCommuteSchedule = {
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
  };

  it("should render the schedule", () => {
    const setCommuteModes = jest.fn();
    const commuteModes = {};

    render(
      <CommuteSchedule
        schedule={commuteSchedule}
        commuteModes={commuteModes}
        setCommuteModes={setCommuteModes}
      />
    );

    expect(
      screen.getByText("NICE Regular - 09:00 to 09:35 ($2.90)")
    ).toBeInTheDocument();
  });
});
