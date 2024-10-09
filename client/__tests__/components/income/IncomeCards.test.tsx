import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import IncomeCards from "../../../components/incomes/IncomeCards";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("IncomeCards", () => {
  it("renders income cards with provided incomes and taxes", () => {
    render(<IncomeCards accountId={1} incomes={[]} taxes={[]} />);

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
