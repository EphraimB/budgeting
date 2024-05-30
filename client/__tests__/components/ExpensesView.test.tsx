import React from "react";
import { render, screen } from "@testing-library/react";
import ExpensesView from "../../components/ExpensesView";
import "@testing-library/jest-dom";
import { Expense } from "@/app/types/types";

describe("ExpensesView", () => {
  const setExpenseModes = jest.fn();

  const expense: Expense = {
    id: 1,
    tax_id: null,
    account_id: 1,
    title: "Test",
    description: "This is a test expense",
    amount: 1000,
    next_date: "2022-01-01T00:00:00.000Z",
    frequency_day_of_month: null,
    frequency_day_of_week: null,
    frequency_type: 2,
    frequency_type_variable: 1,
    frequency_week_of_month: null,
    frequency_month_of_year: null,
    subsidized: 0,
    begin_date: "2021-01-01T00:00:00.000Z",
    end_date: null,
    date_created: "2021-10-01T00:00:00.000Z",
    date_modified: "2021-10-01T00:00:00.000Z",
  };

  it("renders", () => {
    render(
      <ExpensesView
        expense={expense}
        setExpenseModes={setExpenseModes}
        taxes={[]}
      />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You will be charged $1000.00 next on Friday December 31, 2021 7:00 PM. You get charged monthly on the 31st."
      )
    ).toBeInTheDocument();
  });
});
