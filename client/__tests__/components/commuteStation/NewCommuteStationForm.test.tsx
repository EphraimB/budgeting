import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewCommuteStationForm from "../../../components/commuteStation/NewCommuteStationForm";
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
  const setShowCommuteStationForm = jest.fn();

  it("renders correctly with commute station details", async () => {
    render(
      <NewCommuteStationForm
        commuteSystemId={1}
        setShowCommuteStationForm={setShowCommuteStationForm}
      />
    );

    expect(
      screen.getByText(`New Commute Station - Step 1 of 2`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("From station")).toHaveValue("");
    expect(screen.getByLabelText("To station")).toHaveValue("");

    // Navigate to step 2
    const nextButton = screen.getByText("Next");
    await userEvent.click(nextButton);

    expect(screen.getByLabelText("Trip duration (minutes)")).toHaveValue("0");
  });
});
