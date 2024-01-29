import React from "react";
import { render, screen } from "@testing-library/react";
import ExpensesTable from "../../components/ExpensesTable";
import "@testing-library/jest-dom";

describe("ExpensesTable", () => {
  it("renders ExpensesTable component", () => {
    render(
      <ExpensesTable
        account_id={1}
        expenses={[
          {
            id: 1,
            tax_id: 1,
            title: "Rent",
            description: "Monthly rent",
            amount: 1000,
            frequency_type: 2,
            frequency_type_variable: 1,
            frequency_day_of_month: null,
            frequency_day_of_week: null,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            begin_date: "2021-10-01",
            end_date: null,
            subsidized: 0,
            account_id: 1,
            date_created: "2021-10-01T00:00:00.000Z",
            date_modified: "2021-10-01T00:00:00.000Z",
          },
        ]}
        taxes={[
          {
            id: 1,
            title: "GST",
            description: "Goods and Services Tax",
            rate: 0.05,
            type: 1,
            date_created: "2021-10-01T00:00:00.000Z",
            date_modified: "2021-10-01T00:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Amount ($)")).toBeInTheDocument();
    expect(screen.getByText("Next expense date")).toBeInTheDocument();
    expect(screen.getByText("Expense frequency")).toBeInTheDocument();
  });
});
