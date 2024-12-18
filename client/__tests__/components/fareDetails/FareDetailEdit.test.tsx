import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareDetailEdit from "../../../components/fareDetails/FareDetailEdit";
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

describe("FareDetailEdit Component", () => {
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

  const fareDetails = [
    {
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
    },
    {
      id: 2,
      accountId: 1,
      commuteSystemId: 1,
      commuteSystemName: "OMNY",
      stationId: 1,
      name: "Train System",
      fare: 5,
      timeslots: [],
      alternateFareDetailId: null,
      duration: null,
      dayStart: null,
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
  ];

  it("renders correctly with fare details", async () => {
    render(
      <FareDetailEdit
        accountId={1}
        commuteSystemId={1}
        commuteStationId={1}
        fareDetail={fareDetail}
        fareDetails={fareDetails}
        setFareDetailModes={mockSetFareDetailModes}
      />
    );

    expect(
      screen.getByText(`Edit Fare Detail - Step 1 of 3`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Bus System");
    expect(screen.getByLabelText("Fare")).toHaveValue("2.76");

    // Navigate to step 2
    const nextButton = screen.getByText("Next");
    await userEvent.click(nextButton);

    const fareDurationEnabledCheckbox = screen.getByLabelText(
      "Fare duration enabled"
    );

    await userEvent.click(fareDurationEnabledCheckbox);

    expect(fareDurationEnabledCheckbox).toBeChecked();

    const dayStartEnabledCheckbox = screen.getByLabelText("Day start enabled");

    await userEvent.click(dayStartEnabledCheckbox);

    expect(dayStartEnabledCheckbox).toBeChecked();

    // Navigate to step 3
    await userEvent.click(nextButton);

    expect(screen.getByLabelText("Alternate fare")).toBeInTheDocument();
  });
});
