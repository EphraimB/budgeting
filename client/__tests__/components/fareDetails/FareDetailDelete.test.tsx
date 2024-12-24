import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareDetailDelete from "../../../components/fareDetails/FareDetailDelete";
import { FareDetail } from "@/app/types/types";

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

  const fareDetail: FareDetail = {
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
