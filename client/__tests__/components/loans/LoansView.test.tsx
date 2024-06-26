import React from "react";
import { render, screen } from "@testing-library/react";
import LoansView from "../../components/LoansView";
import "@testing-library/jest-dom";
import { Loan } from "@/app/types/types";

describe("LoansView", () => {
  const setLoanModes = jest.fn();

  const loan: Loan = {
    id: 1,
    account_id: 1,
    recipient: "John Doe",
    title: "Test",
    description: "This is a test loan",
    plan_amount: 100,
    amount: 1000,
    next_date: "2022-01-01T00:00:00.000Z",
    frequency_day_of_month: null,
    frequency_day_of_week: null,
    frequency_type: 2,
    frequency_type_variable: 1,
    frequency_week_of_month: null,
    frequency_month_of_year: null,
    subsidized: 0,
    interest_rate: 0,
    interest_frequency_type: 0,
    begin_date: "2021-01-01T00:00:00.000Z",
    end_date: null,
    fully_paid_back: null,
    date_created: "2021-10-01T00:00:00.000Z",
    date_modified: "2021-10-01T00:00:00.000Z",
  };

  it("renders", () => {
    render(<LoansView loan={loan} setLoanModes={setLoanModes} />);

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You will be charged $100.00 next on Friday December 31, 2021 7:00 PM. You get charged monthly on the 31st. This loan won't be paid off in the near future."
      )
    ).toBeInTheDocument();
  });
});
