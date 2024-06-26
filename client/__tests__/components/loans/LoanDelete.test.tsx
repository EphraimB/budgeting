import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoanDelete from "../../../components/loans/LoanDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("LoanDelete", () => {
  it("renders the component", () => {
    const loan = {
      account_id: 1,
      id: 1,
      tax_id: 1,
      recipient: "Test Recipient",
      title: "Test Loan",
      amount: 1000.0,
      plan_amount: 100.0,
      description: "Test Description",
      frequency_type: 2,
      frequency_type_variable: 1,
      frequency_day_of_month: null,
      frequency_day_of_week: null,
      frequency_week_of_month: null,
      frequency_month_of_year: null,
      subsidized: 0,
      interest_rate: 0.05,
      interest_frequency_type: 2,
      begin_date: "2021-10-01",
      end_date: null,
      next_date: null,
      fully_paid_back: "2022-10-01",
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(<LoanDelete loan={loan} setLoanModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Loan"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
