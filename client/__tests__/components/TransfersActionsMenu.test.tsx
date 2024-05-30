import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransfersActionsMenu from "../../components/TransfersActionsMenu";

const setTransferModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("TransfersActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <TransfersActionsMenu
        transfer_id={1}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setTransferModes={setTransferModes}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
