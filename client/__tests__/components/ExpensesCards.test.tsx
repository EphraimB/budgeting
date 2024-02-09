import React from "react";
import { render, screen } from "@testing-library/react";
import ExpenseCards from "../../components/ExpensesCards";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("ExpensesCards", () => {
  it("renders expense cards with provided expenses and taxes", () => {
    const account_id = 1;

    render(<ExpenseCards account_id={account_id} expenses={[]} taxes={[]} />);

    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
