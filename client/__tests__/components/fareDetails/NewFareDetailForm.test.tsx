import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewFareDetailForm from "../../../components/fareDetails/NewFareDetailForm";
import userEvent from "@testing-library/user-event";
import { FareDetail } from "@/app/types/types";

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

jest.mock("../../../services/actions/fareDetail", () => ({
  addFareDetail: jest.fn(),
}));

describe("NewFareDetailForm Component", () => {
  const setShowFareDetailForm = jest.fn();

  const fareDetails: FareDetail[] = [
    {
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
    },
    {
      id: 2,
      accountId: 1,
      commuteSystemName: "OMNY",
      name: "Train System",
      fromStation: "Cedarhurst Av",
      toStation: "Hempstead Av/Spruce St",
      tripDuration: 35,
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
      <NewFareDetailForm
        accountId={1}
        commuteSystemId={1}
        commuteStationId={1}
        fareDetails={fareDetails}
        setShowFareDetailForm={setShowFareDetailForm}
      />
    );

    expect(
      screen.getByText(`New Fare Detail - Step 1 of 3`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Fare")).toHaveValue("0");

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
