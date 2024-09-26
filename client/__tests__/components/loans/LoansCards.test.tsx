import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoansCards from "../../../components/loans/LoansCards";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("LoansCards", () => {
  it("renders loan cards with provided loans", () => {
    const account_id = 1;

    render(<LoansCards accountId={account_id} loans={[]} />);

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
