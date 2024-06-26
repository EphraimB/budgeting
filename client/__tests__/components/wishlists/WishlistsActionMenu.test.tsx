import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WishlistsActionsMenu from "../../../components/wishlists/WishlistsActionsMenu";

const setWishlistModes = jest.fn();

const anchorEl = document.createElement("div");

const open = true;

const handleClose = () => jest.fn();

describe("WishlistsActionsMenu", () => {
  it("displays the menu when the button is clicked", async () => {
    render(
      <WishlistsActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setWishlistModes={setWishlistModes}
        wishlist_id={1}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
