import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountActionsMenu from "../components/AccountActionsMenu";

const setAccountModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("AccountActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    const { getByText } = render(
      <AccountActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setAccountModes={setAccountModes}
        accountId={1}
      />
    );

    expect(getByText("Edit")).toBeInTheDocument();
    expect(getByText("Delete")).toBeInTheDocument();
    expect(getByText("Deposit")).toBeInTheDocument();
    expect(getByText("Withdraw")).toBeInTheDocument();
  });
});
