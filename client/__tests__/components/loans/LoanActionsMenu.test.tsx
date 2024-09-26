import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoanActionsMenu from "../../../components/loans/LoanActionsMenu";

const setLoanModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("LoanActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <LoanActionsMenu
        loanId={1}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setLoanModes={setLoanModes}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
