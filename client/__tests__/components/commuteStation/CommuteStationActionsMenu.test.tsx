import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteStationActionsMenu from "../../../components/commuteStation/CommuteStationActionsMenu";

describe("CommuteStationActionsMenu Component", () => {
  const mockHandleClose = jest.fn();
  const mockSetCommuteSystemModes = jest.fn();
  const mockAnchorEl = document.createElement("div"); // Mock element for anchor

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMenu = (open: boolean) => {
    render(
      <CommuteStationActionsMenu
        anchorEl={open ? mockAnchorEl : null}
        open={open}
        handleClose={mockHandleClose}
        setCommuteStationModes={mockSetCommuteSystemModes}
        commuteStationId={1}
      />
    );
  };

  it("renders the menu when open", () => {
    renderMenu(true);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("does not render the menu when not open", () => {
    renderMenu(false);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
