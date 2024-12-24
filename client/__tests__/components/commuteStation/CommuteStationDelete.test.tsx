import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteStationDelete from "../../../components/commuteStation/CommuteStationDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/commuteStation", () => ({
  deleteCommuteStation: jest.fn(),
}));

describe("CommuteStationDelete Component", () => {
  const mockSetCommuteStationModes = jest.fn();

  const commuteStation = {
    id: 1,
    fromStation: "23 St",
    toStation: "14 St",
    tripDuration: 2,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  it("renders correctly with commute system details", () => {
    render(
      <CommuteStationDelete
        commuteStation={commuteStation}
        setCommuteStationModes={mockSetCommuteStationModes}
      />
    );

    expect(
      screen.getByText(`Delete stations traveling from 23 St to 14 St?`)
    ).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
