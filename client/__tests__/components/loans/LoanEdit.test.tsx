import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoanEdit from "../../../components/loans/LoanEdit";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("LoanEdit", () => {
  it("renders the component", async () => {
    const loan = {
      account_id: 1,
      id: 1,
      recipient: "Test Recipient",
      title: "Test Loan",
      plan_amount: 99.99,
      amount: 999.99,
      description: "Test Description",
      frequency_type: 2,
      frequency_type_variable: 1,
      frequency_day_of_month: null,
      frequency_day_of_week: null,
      frequency_week_of_month: null,
      frequency_month_of_year: null,
      subsidized: 0,
      interest_rate: 0.05,
      interest_frequency_type: 1,
      begin_date: "2021-10-01",
      end_date: null,
      next_date: null,
      fully_paid_back: "2022-10-01",
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(<LoanEdit account_id={1} loan={loan} setLoanModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("Edit Loan - Step 1 of 5")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Recipient")).toHaveValue("Test Recipient");
    expect(screen.getByLabelText("Title")).toHaveValue("Test Loan");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Test Description"
    );

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Loan - Step 2 of 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Plan Amount")).toHaveValue(99.99);
    expect(screen.getByLabelText("Amount")).toHaveValue(999.99);

    expect(screen.getByLabelText("Subsidized")).toHaveValue(0);

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Loan - Step 3 of 5")).toBeInTheDocument();

    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Monthly"));
    expect(screen.getByText("Yearly")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();

    const dayOfWeek = screen.getByLabelText("Day of Week");
    expect(dayOfWeek).toBeInTheDocument();
    expect(within(dayOfWeek).getByText("None")).toBeInTheDocument();

    await userEvent.click(dayOfWeek);
    expect(screen.getByText("Sunday")).toBeInTheDocument();
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(screen.getByText("Wednesday")).toBeInTheDocument();
    expect(screen.getByText("Thursday")).toBeInTheDocument();
    expect(screen.getByText("Friday")).toBeInTheDocument();
    expect(screen.getByText("Saturday")).toBeInTheDocument();

    const weekOfMonth = screen.getByLabelText("Week of Month");
    expect(weekOfMonth).toBeInTheDocument();
    expect(within(weekOfMonth).getByText("None")).toBeInTheDocument();

    await userEvent.click(weekOfMonth);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
    expect(screen.getByText("Fourth")).toBeInTheDocument();
    expect(screen.getByText("Last")).toBeInTheDocument();

    // Make sure that the "Month of Year" input is not present
    expect(screen.queryByLabelText("Month of Year")).not.toBeInTheDocument();

    // Switch to yearly frequency
    await userEvent.click(screen.getByText("Yearly"));

    const monthOfYear = screen.getByLabelText("Month of Year");
    expect(monthOfYear).toBeInTheDocument();
    expect(within(monthOfYear).getByText("None")).toBeInTheDocument();

    await userEvent.click(monthOfYear);
    expect(screen.getByText("January")).toBeInTheDocument();
    expect(screen.getByText("February")).toBeInTheDocument();
    expect(screen.getByText("March")).toBeInTheDocument();
    expect(screen.getByText("April")).toBeInTheDocument();
    expect(screen.getByText("May")).toBeInTheDocument();
    expect(screen.getByText("June")).toBeInTheDocument();
    expect(screen.getByText("July")).toBeInTheDocument();
    expect(screen.getByText("August")).toBeInTheDocument();
    expect(screen.getByText("September")).toBeInTheDocument();
    expect(screen.getByText("October")).toBeInTheDocument();
    expect(screen.getByText("November")).toBeInTheDocument();
    expect(screen.getByText("December")).toBeInTheDocument();

    // Click on the "Yearly" frequency again to make the other options appear
    await userEvent.click(screen.getByText("Yearly"));

    // Switch to daily frequency
    await userEvent.click(screen.getByText("Daily"));

    // Make sure that the "Day of Week" input is not present
    expect(screen.queryByLabelText("Day of Week")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Week of Month")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Month of Year")).not.toBeInTheDocument();

    // Click on the "Daily" frequency again to make the other options appear
    await userEvent.click(screen.getByText("Daily"));

    // Switch to weekly frequency
    await userEvent.click(screen.getByText("Weekly"));

    // Make sure that the "Day of Week" input is present
    expect(screen.queryByLabelText("Day of Week")).toBeInTheDocument();
    expect(screen.queryByLabelText("Week of Month")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Month of Year")).not.toBeInTheDocument();

    // Make sure that "Frequency Type Variable" input is present
    expect(
      screen.getByLabelText("Frequency Type Variable")
    ).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Loan - Step 4 of 5")).toBeInTheDocument();

    expect(screen.getByLabelText("Interest Rate")).toHaveValue("5%");
    expect(screen.getByLabelText("Interest Frequency")).toBeInTheDocument();

    expect(screen.getByText("Weekly")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Weekly"));
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Yearly")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Loan - Step 5 of 5")).toBeInTheDocument();

    expect(screen.getByLabelText("Loan begin date")).toHaveValue(
      "10/01/2021 12:00 AM"
    );

    // Check that "Submit" button is present
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
