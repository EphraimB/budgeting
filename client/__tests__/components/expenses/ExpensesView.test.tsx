import React from "react";
import { render, screen } from "@testing-library/react";
import ExpensesView from "../../../components/expenses/ExpensesView";
import "@testing-library/jest-dom";
import { Expense } from "@/app/types/types";

describe("ExpensesView", () => {
  const setExpenseModes = jest.fn();

  const expense: Expense = {
    id: 1,
    taxId: null,
    accountId: 1,
    title: "Test",
    description: "This is a test expense",
    amount: 1000,
    nextDate: "2022-01-01T00:00:00.000Z",
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
      beginDate: "2021-01-01T00:00:00.000Z",
      endDate: null,
    },
    dateCreated: "2021-10-01T00:00:00.000Z",
    dateModified: "2021-10-01T00:00:00.000Z",
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
