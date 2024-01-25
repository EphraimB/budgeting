import React from "react";
import { render, screen } from "@testing-library/react";
import ExpensesWidget from "../../components/ExpensesWidget";
import "@testing-library/jest-dom";

describe("ExpensesWidget", () => {
  it("renders ExpensesWidget component", () => {
    render(<ExpensesWidget account_id={1} />);

    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(
      screen.getByText("View and manage your expenses.")
    ).toBeInTheDocument();
  });
});
