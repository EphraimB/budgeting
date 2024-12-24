import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewCommuteSystemForm from "../../../components/commuteSystem/NewCommuteSystemForm";
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

jest.mock("../../../services/actions/commuteSystem", () => ({
  addCommuteSystem: jest.fn(),
}));

describe("NewCommuteSystemForm Component", () => {
  const setShowCommuteSystemForm = jest.fn();

  it("renders correctly with commute system details", () => {
    render(
      <NewCommuteSystemForm
        setShowCommuteSystemForm={setShowCommuteSystemForm}
      />
    );

    expect(
      screen.getByText(`New Commute System - Step 1 of 2`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("updates the fare cap and duration fields correctly", async () => {
    render(
      <NewCommuteSystemForm
        setShowCommuteSystemForm={setShowCommuteSystemForm}
      />
    );

    // Navigate to step 2
    const nextButton = screen.getByText("Next");
    await userEvent.click(nextButton);

    // Check the checkbox and update fare cap
    const fareCapCheckbox = screen.getByLabelText("Fare cap enabled");

    await userEvent.click(fareCapCheckbox);
    expect(fareCapCheckbox).toBeChecked();

    const fareCapField = screen.getByLabelText("Fare cap");
    userEvent.clear(fareCapField);
    await userEvent.type(fareCapField, "200");

    // Find the Select element
    const durationSelect = screen.getByLabelText("Fare cap duration");

    // Open the dropdown
    await userEvent.click(durationSelect);

    // Find the MenuItem with the text "Weekly"
    const weeklyOption = await screen.findByRole("option", { name: "Weekly" });

    // Click the Weekly option
    await userEvent.click(weeklyOption);

    expect(fareCapField).toHaveValue("200");

    // Verify that the value has been updated to "1"
    expect(durationSelect).toHaveTextContent("Weekly");
  });
});
