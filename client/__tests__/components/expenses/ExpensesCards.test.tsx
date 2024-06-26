import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ExpensesCards from "../../../components/expenses/ExpensesCards";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("ExpensesCards", () => {
  it("renders expense cards with provided expenses and taxes", () => {
    const account_id = 1;

    render(<ExpensesCards account_id={account_id} expenses={[]} taxes={[]} />);

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
