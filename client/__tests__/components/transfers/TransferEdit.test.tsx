import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransferEdit from "../../../components/transfers/TransferEdit";
import dayjs from "dayjs";
import { Account, Transfer } from "@/app/types/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("TransferEdit", () => {
  it("renders the component", async () => {
    const transfer: Transfer = {
      source_account_id: 1,
      destination_account_id: 2,
      id: 1,
      transfer_title: "Test Transfer",
      transfer_amount: 155.99,
      transfer_description: "Test Description",
      frequency_type: 2,
      frequency_type_variable: 1,
      frequency_day_of_month: null,
      frequency_day_of_week: null,
      frequency_week_of_month: null,
      frequency_month_of_year: null,
      transfer_begin_date: "2021-10-01",
      transfer_end_date: null,
      next_date: "2021-11-01",
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    const accounts: Account[] = [
      {
        account_id: 2,
        account_name: "Testing 2",
        account_balance: 500,
        date_created: "2023-10-10",
        date_modified: "2023-10-10",
      },
      {
        account_id: 3,
        account_name: "Testing 3",
        account_balance: 400,
        date_created: "2023-10-10",
        date_modified: "2023-10-10",
      },
    ];

    render(
      <TransferEdit
        account_id={1}
        transfers={transfer}
        setTransferModes={() => {}}
        accounts={accounts}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("Edit Transfer - Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toHaveValue("Test Transfer");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Test Description"
    );

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Transfer - Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toHaveValue(155.99);

    expect(screen.getByLabelText("Account")).toBeInTheDocument();
    expect(screen.getByText("Testing 2 - $500"));

    await userEvent.click(screen.getByText("Testing 2 - $500"));
    expect(screen.getByText("Testing 3 - $400")).toBeInTheDocument();

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Edit Transfer - Step 3 of 4")).toBeInTheDocument();

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

    expect(screen.getByText("Edit Transfer - Step 4 of 4")).toBeInTheDocument();

    expect(screen.getByLabelText("Transfer begin date")).toHaveValue(
      "09/30/2021 08:00 PM"
    );

    // Check that the "Transfer end date" input is not checked
    expect(
      screen.getByLabelText("Transfer end date enabled")
    ).not.toBeChecked();

    // Check the "Transfer end date" checkbox
    await userEvent.click(screen.getByLabelText("Transfer end date enabled"));

    expect(screen.getByLabelText("Transfer end date enabled")).toBeChecked();

    expect(screen.getByLabelText("Transfer end date")).toHaveValue(
      dayjs().format("MM/DD/YYYY hh:mm A")
    );

    // Check that "Submit" button is present
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
