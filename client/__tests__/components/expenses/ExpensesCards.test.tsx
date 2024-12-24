import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ExpensesCards from "../../../components/expenses/ExpensesCards";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../services/actions/expense", () => ({
  editExpense: jest.fn(),
}));

describe("ExpensesCards", () => {
  it("renders expense cards with provided expenses and taxes", () => {
    render(<ExpensesCards accountId={1} expenses={[]} taxes={[]} />);

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
