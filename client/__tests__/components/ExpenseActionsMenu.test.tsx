import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExpenseActionsMenu from "../../components/ExpenseActionsMenu";

const setExpenseModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("ExpenseActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <ExpenseActionsMenu
        expense_id={1}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setExpenseModes={setExpenseModes}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
