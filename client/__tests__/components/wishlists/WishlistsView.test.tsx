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
      taxId: 1,
      taxRate: 0,
      accountId: 1,
      title: "Wishlist test",
      description: "This is a test wishlist",
      amount: 1000,
      priority: 0,
      dateAvailable: "2024-10-10",
      dateCanPurchase: "2024-10-10",
      urlLink: "",
      dateCreated: "2021-10-01T00:00:00.000Z",
      dateModified: "2021-10-01T00:00:00.000Z",
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
    taxId: 1,
    taxRate: 0,
    accountId: 1,
    title: "iPhone 16 Pro Max",
    description: "iPhone 16 Pro Max 1TB",
    amount: 1599,
    priority: 0,
    dateAvailable: "2024-09-22",
    dateCanPurchase: "2024-09-22",
    urlLink: "https://www.apple.com/iphone",
    dateCreated: "2021-10-01T00:00:00.000Z",
    dateModified: "2021-10-01T00:00:00.000Z",
  };

  render(
    <WishlistsView wishlist={wishlist} setWishlistModes={setWishlistModes} />
  );

  expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
  expect(screen.getByText("iPhone 16 Pro Max")).toBeInTheDocument();
  expect(screen.getByText("iPhone 16 Pro Max 1TB")).toBeInTheDocument();
  expect(
    screen.getByText(
      "You will be charged $1599 for this item on Sunday September 22, 2024 12:00 AM."
    )
  ).toBeInTheDocument();
  expect(screen.getByText("View wishlist item here")).toBeInTheDocument();
});
