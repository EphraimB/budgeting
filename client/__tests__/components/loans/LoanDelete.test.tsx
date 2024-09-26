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
      accountId: 1,
      id: 1,
      taxId: 1,
      recipient: "Test Recipient",
      title: "Test Loan",
      amount: 1000.0,
      planAmount: 100.0,
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
      interestRate: 0.05,
      interestFrequencyType: 2,
      dates: {
        beginDate: "2021-10-01",
      },
      nextDate: null,
      fullyPaidBackDate: "2022-10-01",
      dateCreated: "2021-10-01",
      dateModified: "2021-10-01",
    };

    render(<LoanDelete loan={loan} setLoanModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Loan"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
