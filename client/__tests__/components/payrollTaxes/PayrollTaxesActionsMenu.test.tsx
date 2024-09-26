import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PayrollTaxesActionsMenu from "../../../components/payrollTaxes/PayrollTaxesActionsMenu";

const setPayrollTaxModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("PayrollTaxActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <PayrollTaxesActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setPayrollTaxModes={setPayrollTaxModes}
        payrollTaxId={1}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
