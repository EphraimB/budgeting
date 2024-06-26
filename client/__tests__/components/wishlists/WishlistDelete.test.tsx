import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WishlistDelete from "../../../components/wishlists/WishlistDelete";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("WishlistDelete", () => {
  it("renders the component", () => {
    const wishlist = {
      account_id: 1,
      id: 1,
      tax_id: 1,
      tax_rate: 0,
      wishlist_title: "iPhone SE",
      wishlist_amount: 499,
      wishlist_description: "Cheapest iPhone SE",
      wishlist_priority: 0,
      wishlist_url_link: "https://www.apple.com/iphone",
      preorder: null,
      wishlist_date_available: "2025-04-10",
      wishlist_date_can_purchase: "2025-04-10",
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(<WishlistDelete wishlist={wishlist} setWishlistModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "iPhone SE"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
