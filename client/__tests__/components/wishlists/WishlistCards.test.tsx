import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import WishlistsCards from "../../../components/wishlists/WishlistsCards";
import { Tax } from "@/app/types/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("WishlistCards", () => {
  it("renders wishlist cards with provided wishlists", () => {
    const account_id: number = 1;
    const taxes: Tax[] = [];

    render(
      <WishlistsCards account_id={account_id} wishlists={[]} taxes={taxes} />
    );

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
