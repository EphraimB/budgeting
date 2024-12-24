import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteStationEdit from "../../../components/commuteStation/CommuteStationEdit";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("CommuteStationEdit Component", () => {
  const mockSetCommuteStationModes = jest.fn();

  const commuteStation = {
    id: 1,
    fromStation: "23 St",
    toStation: "14 St",
    tripDuration: 2,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  it("renders correctly with commute station details", async () => {
    render(
      <CommuteStationEdit
        commuteSystemId={1}
        commuteStation={commuteStation}
        setCommuteStationModes={mockSetCommuteStationModes}
      />
    );

    expect(
      screen.getByText(`Edit Commute Station - Step 1 of 2`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("From station")).toHaveValue("23 St");
    expect(screen.getByLabelText("To station")).toHaveValue("14 St");

    // Navigate to step 2
    const nextButton = screen.getByText("Next");
    await userEvent.click(nextButton);

    expect(screen.getByLabelText("Trip duration (minutes)")).toHaveValue("2");
  });
});
