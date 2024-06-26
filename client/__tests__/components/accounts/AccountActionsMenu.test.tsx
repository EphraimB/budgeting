import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountActionsMenu from "../../components/accounts/AccountActionsMenu";

const setAccountModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("AccountActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <AccountActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setAccountModes={setAccountModes}
        account_id={1}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Deposit")).toBeInTheDocument();
    expect(screen.getByText("Withdraw")).toBeInTheDocument();
  });
});
