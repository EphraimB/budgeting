import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Income } from "@/app/types/types";
import IncomeView from "../../../components/incomes/IncomeView";

describe("IncomeView", () => {
  const setIncomeModes = jest.fn();

  const income: Income = {
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
    dates: {
      beginDate: "2021-01-01T00:00:00.000Z",
      endDate: null,
    },
    dateCreated: "2021-10-01T00:00:00.000Z",
    dateModified: "2021-10-01T00:00:00.000Z",
  };

  it("renders", () => {
    render(
      <IncomeView income={income} setIncomeModes={setIncomeModes} taxes={[]} />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You will receive $1000.00 next on Friday December 31, 2021 7:00 PM. You will receive this income monthly on the 31st."
      )
    ).toBeInTheDocument();
  });
});
