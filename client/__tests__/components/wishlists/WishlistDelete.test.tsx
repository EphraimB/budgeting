import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WishlistDelete from "../../../components/wishlists/WishlistDelete";

jest.mock("../../../context/FeedbackContext", () => ({
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
      accountId: 1,
      id: 1,
      taxId: 1,
      taxRate: 0,
      title: "iPhone SE",
      amount: 499,
      description: "Cheapest iPhone",
      priority: 0,
      urlLink: "https://www.apple.com/iphone",
      preorder: null,
      dateAvailable: "2025-04-10",
      dateCanPurchase: "2025-04-10",
      dateCreated: "2021-10-01",
      dateModified: "2021-10-01",
    };

    render(<WishlistDelete wishlist={wishlist} setWishlistModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "iPhone SE"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
