import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TaxActionsMenu from "../../components/taxes/TaxActionsMenu";

const setTaxModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("TaxActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <TaxActionsMenu
        tax_id={1}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setTaxModes={setTaxModes}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
