import React from "react";
import { render, screen } from "@testing-library/react";
import ExpensesWidget from "../../components/ExpensesWidget";
import "@testing-library/jest-dom";

describe("ExpensesWidget", () => {
  const expenses = [
    {
      id: 1,
      account_id: 1,
      amount: 100,
      title: "Test expense",
      description: "Test expense",
      tax_id: 1,
      frequency_type: 2,
      frequency_type_variable: 1,
      frequency_day_of_month: null,
      frequency_day_of_week: null,
      frequency_week_of_month: null,
      frequency_month_of_year: null,
      subsidized: 0,
      next_date: "2021-02-01T00:00:00.000Z",
      begin_date: "2021-01-01T00:00:00.000Z",
      end_date: null,
      date_created: "2021-01-01T00:00:00.000Z",
      date_modified: "2021-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      account_id: 1,
      amount: 10,
      title: "Test expense 2",
      description: "Test expense 2",
      tax_id: null,
      frequency_type: 2,
      frequency_type_variable: 1,
      frequency_day_of_month: null,
      frequency_day_of_week: null,
      frequency_week_of_month: null,
      frequency_month_of_year: null,
      subsidized: 0,
      next_date: "2021-02-01T00:00:00.000Z",
      begin_date: "2021-01-01T00:00:00.000Z",
      end_date: null,
      date_created: "2021-01-01T00:00:00.000Z",
      date_modified: "2021-01-01T00:00:00.000Z",
    },
  ];

  const taxes = [
    {
      id: 1,
      title: "Test tax",
      description: "Test tax",
      rate: 0.1,
      type: 1,
      date_created: "2021-01-01T00:00:00.000Z",
      date_modified: "2021-01-01T00:00:00.000Z",
    },
  ];

  it("renders ExpensesWidget component with no expenses", () => {
    render(<ExpensesWidget expenses={[]} taxes={[]} account_id={1} />);

    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("You have 0 expenses with a total of $0.00 including taxes.")).toBeInTheDocument();
  });

  it("renders ExpensesWidget component with one expense", () => {
    render(
      <ExpensesWidget
        expenses={expenses.slice(0, 1)}
        taxes={taxes}
        account_id={1}
      />
    );

    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 1 expense with a total of $110.00 including taxes."
      )
    ).toBeInTheDocument();
  });

  it("renders ExpensesWidget component with multiple expenses", () => {
    render(<ExpensesWidget expenses={expenses} taxes={taxes} account_id={1} />);

    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 2 expenses with a total of $120.00 including taxes."
      )
    ).toBeInTheDocument();
  });
});
