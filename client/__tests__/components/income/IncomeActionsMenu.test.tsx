import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import IncomeActionsMenu from "../../../components/incomes/IncomeActionsMenu";

const setIncomeModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("IncomeActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <IncomeActionsMenu
        incomeId={1}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setIncomeModes={setIncomeModes}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
