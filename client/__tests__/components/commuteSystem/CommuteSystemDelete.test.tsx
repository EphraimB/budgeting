import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSystemDelete from "../../../components/commuteSystem/CommuteSystemDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/commuteSystem", () => ({
  deleteCommuteSystem: jest.fn(),
}));

describe("CommuteSystemDelete Component", () => {
  const mockSetCommuteSystemModes = jest.fn();

  const commuteSystem = {
    id: 1,
    name: "Test System",
    fareCap: null,
    fareCapDuration: null,
    dateCreated: "2020-01-01",
    dateModified: "2020-01-01",
  };

  it("renders correctly with commute system details", () => {
    render(
      <CommuteSystemDelete
        commuteSystem={commuteSystem}
        setCommuteSystemModes={mockSetCommuteSystemModes}
      />
    );

    expect(screen.getByText(`Delete "Test System"?`)).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
