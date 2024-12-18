import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareDetailDelete from "../../../components/fareDetails/FareDetailDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("FareDetailDelete Component", () => {
  const mockSetFareDetailModes = jest.fn();

  const fareDetail = {
    id: 1,
    accountId: 1,
    commuteSystemId: 1,
    commuteSystemName: "OMNY",
    stationId: 1,
    name: "Bus System",
    fare: 2.76,
    timeslots: [],
    alternateFareDetailId: null,
    duration: null,
    dayStart: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  it("renders correctly with commute system details", () => {
    render(
      <FareDetailDelete
        fareDetail={fareDetail}
        setFareDetailModes={mockSetFareDetailModes}
      />
    );

    expect(screen.getByText(`Delete "Bus System"?`)).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
