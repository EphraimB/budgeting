import React from "react";
import { render, screen } from "@testing-library/react";
import LoansWidget from "../../components/LoansWidget";
import "@testing-library/jest-dom";

describe("LoansWidget", () => {
  it("renders LoansWidget component with a fully paid back date", () => {
    const loans = [
      {
        id: 1,
        account_id: 1,
        recipient: "Test recipient",
        amount: 1000,
        plan_amount: 100,
        title: "Test loan",
        description: "Test loan",
        frequency_type: 2,
        frequency_type_variable: 1,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0,
        interest_rate: 0.1,
        interest_frequency_type: 1,
        begin_date: "2021-01-01T00:00:00.000Z",
        next_date: "2021-02-01T00:00:00.000Z",
        end_date: null,
        fully_paid_back: "2023-01-01T00:00:00.000Z",
        date_created: "2021-01-01T00:00:00.000Z",
        date_modified: "2021-01-01T00:00:00.000Z",
      },
    ];

    render(<LoansWidget loans={loans} account_id={1} />);

    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 1 loan with a total of $1000.00. You will be debt free Sun, 01 Jan 2023 00:00:00 GMT."
      )
    ).toBeInTheDocument();
  });

  it("renders LoansWidget component without a fully paid back date", () => {
    const loans = [
      {
        id: 1,
        account_id: 1,
        recipient: "Test recipient",
        amount: 1000,
        plan_amount: 100,
        title: "Test loan",
        description: "Test loan",
        frequency_type: 2,
        frequency_type_variable: 1,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0,
        begin_date: "2021-01-01T00:00:00.000Z",
        next_date: "2023-01-01T00:00:00.000Z",
        interest_rate: 0.1,
        interest_frequency_type: 1,
        end_date: null,
        fully_paid_back: null,
        date_created: "2021-01-01T00:00:00.000Z",
        date_modified: "2021-01-01T00:00:00.000Z",
      },
    ];

    render(<LoansWidget loans={loans} account_id={1} />);

    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 1 loan with a total of $1000.00. You will be debt free not in the near future."
      )
    ).toBeInTheDocument();
  });

  it("renders LoansWidget component with multiple loans", () => {
    const loans = [
      {
        id: 1,
        account_id: 1,
        recipient: "Test recipient",
        amount: 1000,
        plan_amount: 100,
        title: "Test loan",
        description: "Test loan",
        frequency_type: 2,
        frequency_type_variable: 1,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0,
        begin_date: "2021-01-01T00:00:00.000Z",
        next_date: "2021-02-01T00:00:00.000Z",
        end_date: null,
        interest_rate: 0.1,
        interest_frequency_type: 1,
        fully_paid_back: "2023-01-01T00:00:00.000Z",
        date_created: "2021-01-01T00:00:00.000Z",
        date_modified: "2021-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        account_id: 1,
        recipient: "Test recipient",
        amount: 2000,
        plan_amount: 50,
        title: "Test loan 2",
        description: "Test loan 2",
        frequency_type: 2,
        frequency_type_variable: 1,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0,
        begin_date: "2021-01-01T00:00:00.000Z",
        next_date: "2021-02-01T00:00:00.000Z",
        end_date: null,
        interest_rate: 0.1,
        interest_frequency_type: 1,
        fully_paid_back: "2024-01-01T00:00:00.000Z",
        date_created: "2021-01-01T00:00:00.000Z",
        date_modified: "2021-01-01T00:00:00.000Z",
      },
    ];

    render(<LoansWidget loans={loans} account_id={1} />);

    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 2 loans with a total of $3000.00. You will be debt free Mon, 01 Jan 2024 00:00:00 GMT."
      )
    ).toBeInTheDocument();
  });
});
