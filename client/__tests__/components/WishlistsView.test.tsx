import React from "react";
import { render, screen } from "@testing-library/react";
import WishlistsView from "../../components/WishlistsView";
import "@testing-library/jest-dom";
import { Wishlist } from "@/app/types/types";

describe("WishlistView", () => {
  const setWishlistModes = jest.fn();

  const wishlist: Wishlist = {
    id: 1,
    tax_id: 1,
    tax_rate: 0,
    account_id: 1,
    wishlist_title: "Wishlist test",
    wishlist_description: "This is a test wishlist",
    wishlist_amount: 1000,
    wishlist_priority: 0,
    wishlist_date_available: "2024-10-10",
    wishlist_date_can_purchase: "2024-10-10",
    wishlist_url_link: "",
    date_created: "2021-10-01T00:00:00.000Z",
    date_modified: "2021-10-01T00:00:00.000Z",
  };

  it("renders", () => {
    render(
      <WishlistsView wishlist={wishlist} setWishlistModes={setWishlistModes} />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Wishlist test")).toBeInTheDocument();
    expect(screen.getByText("This is a test wishlist")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You will be charged $1000 for this item on  next on Thursday Octoober 10, 2024 12:00 AM."
      )
    ).toBeInTheDocument();
  });
});
