import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExpenseDelete from "../../../components/expenses/ExpenseDelete";

jest.mock("../../../context/FeedbackContext", () => ({
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
      accountId: 1,
      id: 1,
      taxId: 1,
      title: "Test Expense",
      amount: 155.99,
      description: "Test Description",
      frequency: {
        type: 2,
        typeVariable: 1,
        dayOfMonth: null,
        dayOfWeek: null,
        weekOfMonth: null,
        monthOfYear: null,
      },
      subsidized: 0,
      dates: {
        beginDate: "2021-10-01",
        endDate: null,
      },
      nextDate: null,
      dateCreated: "2021-10-01",
      dateModified: "2021-10-01",
    };

    render(<ExpenseDelete expense={expense} setExpenseModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Expense"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
