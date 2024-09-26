import React from "react";
import { render, screen } from "@testing-library/react";
import LoansView from "../../../components/loans/LoansView";
import "@testing-library/jest-dom";
import { Loan } from "@/app/types/types";

describe("LoansView", () => {
  const setLoanModes = jest.fn();

  const loan: Loan = {
    id: 1,
    accountId: 1,
    recipient: "John Doe",
    title: "Test",
    description: "This is a test loan",
    planAmount: 100,
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
    interestRate: 0,
    interestFrequencyType: 0,
    dates: {
      beginDate: "2021-01-01T00:00:00.000Z",
    },
    fullyPaidBackDate: null,
    dateCreated: "2021-10-01T00:00:00.000Z",
    dateModified: "2021-10-01T00:00:00.000Z",
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
