import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewWishlistForm from "../../../components/wishlists/NewWishlistForm";
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

describe("NewWishlistForm", () => {
  it("renders the component", async () => {
    const setShowWishlistForm = jest.fn();

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
      <NewWishlistForm
        account_id={1}
        taxes={taxes}
        setShowWishlistForm={setShowWishlistForm}
        total_items={1}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("Add wishlist - Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Add wishlist - Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax")).toBeInTheDocument();
    expect(screen.getByText("No tax - 0%"));

    await userEvent.click(screen.getByText("No tax - 0%"));
    expect(screen.getByText("NYC sales tax - 8.875%"));

    expect(screen.getByLabelText("Priority")).toBeInTheDocument();

    expect(screen.getByLabelText("URL Link")).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Add wishlist - Step 3 of 3")).toBeInTheDocument();

    // Check that the "Preorder?" input is not checked
    expect(screen.getByLabelText("Preorder?")).not.toBeChecked();

    // Check the "Preorder?" checkbox
    await userEvent.click(screen.getByLabelText("Preorder?"));

    expect(screen.getByLabelText("Product avalable date")).toHaveValue(
      dayjs().format("MM/DD/YYYY hh:mm A")
    );

    // Check that "Submit" button is present
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
