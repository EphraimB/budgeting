import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WishlistEdit from "../../../components/wishlists/WishlistEdit";
import { Tax } from "@/app/types/types";
import dayjs from "dayjs";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/wishlist", () => ({
  editWishlist: jest.fn(),
}));

describe("WishlistEdit", () => {
  it("renders the component", async () => {
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

    const taxes: Tax[] = [
      {
        id: 1,
        title: "NYC sales tax",
        description: "New York City sales tax",
        rate: 0.08875,
        type: 0,
        dateCreated: "2021-01-01",
        dateModified: "2021-01-01",
      },
    ];

    render(
      <WishlistEdit
        accountId={1}
        wishlist={wishlist}
        taxes={taxes}
        setWishlistModes={() => {}}
        totalItems={1}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("Edit wishlist - Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Amount")).toHaveValue("499");
    expect(screen.getByLabelText("Title")).toHaveValue("iPhone SE");
    expect(screen.getByLabelText("Description")).toHaveValue("Cheapest iPhone");

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit wishlist - Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax")).toBeInTheDocument();
    expect(screen.getByText("NYC sales tax - 8.875%"));

    await userEvent.click(screen.getByText("NYC sales tax - 8.875%"));
    expect(screen.getByText("No tax - 0%"));

    expect(screen.getByLabelText("Priority")).toHaveValue("0");

    expect(screen.getByLabelText("URL Link")).toHaveValue(
      "https://www.apple.com/iphone"
    );

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit wishlist - Step 3 of 3")).toBeInTheDocument();

    // Check that the "Preorder?" input is not checked
    expect(screen.getByLabelText("Preorder?")).toBeChecked();

    expect(screen.getByLabelText("Product avalable date")).toHaveValue(
      dayjs("2025-04-09T20:00").format("MM/DD/YYYY hh:mm A")
    );

    // Uncheck the "Preorder?" checkbox
    await userEvent.click(screen.getByLabelText("Preorder?"));

    expect(screen.getByLabelText("Preorder?")).not.toBeChecked();

    // Check that "Submit" button is present
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
