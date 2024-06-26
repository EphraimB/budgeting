import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExpenseDelete from "../../../components/expenses/ExpenseDelete";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("ExpenseDelete", () => {
  it("renders the component", () => {
    const expense = {
      account_id: 1,
      id: 1,
      tax_id: 1,
      title: "Test Expense",
      amount: 155.99,
      description: "Test Description",
      frequency_type: 2,
      frequency_type_variable: 1,
      frequency_day_of_month: null,
      frequency_day_of_week: null,
      frequency_week_of_month: null,
      frequency_month_of_year: null,
      subsidized: 0,
      begin_date: "2021-10-01",
      end_date: null,
      next_date: null,
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(<ExpenseDelete expense={expense} setExpenseModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Expense"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
