import { CommuteSchedule } from "@/app/types/types";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteScheduleDelete from "../../../components/commuteSchedule/CommuteScheduleDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("CommuteScheduleDelete Component", () => {
  const commuteSchedule: CommuteSchedule = {
    id: 1,
    fareId: 1,
    startTime: "09:00",
    endTime: "09:35",
    fare: 2.9,
    pass: "NICE Regular",
  };

  it("should render the schedule delete mode", () => {
    const setCommuteModes = jest.fn();

    render(
      <CommuteScheduleDelete
        commute={commuteSchedule}
        setCommuteModes={setCommuteModes}
      />
    );

    expect(
      screen.getByText(
        'Are you sure you want to delete the commute "NICE Regular"?'
      )
    ).toBeInTheDocument();

    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});
