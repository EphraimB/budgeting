import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import ExpenseEdit from "../../components/ExpenseEdit";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("ExpenseEdit", () => {
  it("renders the component", async () => {
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

    const taxes = [
      {
        id: 1,
        rate: 0.05,
        title: "Test Tax",
        description: "Test Description",
        type: 1,
        date_created: "2021-10-01",
        date_modified: "2021-10-01",
      },
      {
        id: 2,
        rate: 0.08875,
        title: "NYC Sales Tax",
        description: "New York City Sales Tax",
        type: 1,
        date_created: "2021-10-01",
        date_modified: "2021-10-01",
      },
    ];

    render(
      <ExpenseEdit
        account_id={1}
        expense={expense}
        taxes={taxes}
        setExpenseModes={() => {}}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("Edit Expense - Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toHaveValue("Test Expense");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Test Description"
    );

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Expense - Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toHaveValue("$155.99");

    expect(screen.getByLabelText("Tax")).toBeInTheDocument();
    expect(screen.getByText("Test Tax - 5%"));

    await userEvent.click(screen.getByText("Test Tax - 5%"));
    expect(screen.getByText("NYC Sales Tax - 8.875%")).toBeInTheDocument();
    expect(screen.getByText("No tax - 0%"));

    expect(screen.getByLabelText("Subsidized")).toHaveValue("0%");

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Expense - Step 3 of 4")).toBeInTheDocument();

    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
  });
});
