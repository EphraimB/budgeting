import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSystemEdit from "../../../components/commuteSystem/CommuteSystemEdit";
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

describe("CommuteSystemEdit Component", () => {
  const mockSetCommuteSystemModes = jest.fn();

  const commuteSystem = {
    id: 1,
    name: "Test System",
    fareCap: 100,
    fareCapDuration: 0, // Daily
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  it("renders correctly with commute system details", () => {
    render(
      <CommuteSystemEdit
        commuteSystem={commuteSystem}
        setCommuteSystemModes={mockSetCommuteSystemModes}
      />
    );

    expect(
      screen.getByText(`Edit Commute System - Step 1 of 2`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Test System");
  });

  it("updates the fare cap and duration fields correctly", async () => {
    render(
      <CommuteSystemEdit
        commuteSystem={commuteSystem}
        setCommuteSystemModes={mockSetCommuteSystemModes}
      />
    );

    // Navigate to step 2
    const nextButton = screen.getByText("Next");
    await userEvent.click(nextButton);

    // Check the checkbox and update fare cap
    const fareCapCheckbox = screen.getByLabelText("Fare cap enabled");

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
