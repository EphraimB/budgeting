import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FareDetailActionsMenu from "../../../components/fareDetails/FareDetailActionsMenu";

describe("FareDetailActionsMenu Component", () => {
  const mockHandleClose = jest.fn();
  const mockSetFareDetailModes = jest.fn();
  const mockAnchorEl = document.createElement("div"); // Mock element for anchor

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMenu = (open: boolean) => {
    render(
      <FareDetailActionsMenu
        anchorEl={open ? mockAnchorEl : null}
        open={open}
        handleClose={mockHandleClose}
        setFareDetailModes={mockSetFareDetailModes}
        fareDetailId={1}
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
