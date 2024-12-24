import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommuteSystemActionsMenu from "../../../components/commuteSystem/CommuteSystemActionsMenu";

describe("CommuteSystemActionsMenu Component", () => {
  const mockHandleClose = jest.fn();
  const mockSetCommuteSystemModes = jest.fn();
  const mockAnchorEl = document.createElement("div"); // Mock element for anchor

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMenu = (open: boolean) => {
    render(
      <CommuteSystemActionsMenu
        anchorEl={open ? mockAnchorEl : null}
        open={open}
        handleClose={mockHandleClose}
        setCommuteSystemModes={mockSetCommuteSystemModes}
        commuteSystemId={1}
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
