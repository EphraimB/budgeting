import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WishlistEdit from "../../components/wishlistEdit";
import { Tax } from "@/app/types/types";
import dayjs from "dayjs";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("WishlistEdit", () => {
  it("renders the component", async () => {
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

    const taxes: Tax[] = [
      {
        id: 1,
        title: "NYC sales tax",
        description: "New York City sales tax",
        rate: 0.08875,
        type: 0,
        date_created: "2021-01-01",
        date_modified: "2021-01-01",
      },
    ];

    render(
      <WishlistEdit
        account_id={1}
        wishlist={wishlist}
        taxes={taxes}
        setWishlistModes={() => {}}
        total_items={1}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("Edit wishlist - Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Amount")).toHaveValue("499");
    expect(screen.getByLabelText("Title")).toHaveValue("iPhone SE");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Cheapest iPhone SE"
    );

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
