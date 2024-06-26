import React from "react";
import { render, screen } from "@testing-library/react";
import WishlistsView from "../../../components/wishlists/WishlistsView";
import "@testing-library/jest-dom";
import { Wishlist } from "@/app/types/types";

describe("WishlistView", () => {
  it("Renders a wishlist view without a url link provided", () => {
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

    render(
      <WishlistsView wishlist={wishlist} setWishlistModes={setWishlistModes} />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Wishlist test")).toBeInTheDocument();
    expect(screen.getByText("This is a test wishlist")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You will be charged $1000 for this item on Thursday October 10, 2024 12:00 AM."
      )
    ).toBeInTheDocument();
  });
});

it("Renders a wishlist view with a url link provided", () => {
  const setWishlistModes = jest.fn();

  const wishlist: Wishlist = {
    id: 1,
    tax_id: 1,
    tax_rate: 0,
    account_id: 1,
    wishlist_title: "iPhone 16 Pro Max",
    wishlist_description: "iPhone 16 Pro Max 1TB",
    wishlist_amount: 1699,
    wishlist_priority: 0,
    wishlist_date_available: "2024-09-22",
    wishlist_date_can_purchase: "2024-09-22",
    wishlist_url_link: "https://www.apple.com/iphone",
    date_created: "2021-10-01T00:00:00.000Z",
    date_modified: "2021-10-01T00:00:00.000Z",
  };

  render(
    <WishlistsView wishlist={wishlist} setWishlistModes={setWishlistModes} />
  );

  expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
  expect(screen.getByText("iPhone 16 Pro Max")).toBeInTheDocument();
  expect(screen.getByText("iPhone 16 Pro Max 1TB")).toBeInTheDocument();
  expect(
    screen.getByText(
      "You will be charged $1699 for this item on Sunday September 22, 2024 12:00 AM."
    )
  ).toBeInTheDocument();
  expect(screen.getByText("View wishlist item here")).toBeInTheDocument();
});
