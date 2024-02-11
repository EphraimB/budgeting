import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewExpenseForm from "../../components/NewExpenseForm";
import dayjs from "dayjs";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("NewExpenseForm", () => {
  it("renders the component", async () => {
    const taxes = [
      {
        id: 1,
        rate: 0.05,
        title: "Test Tax",
        description: "Test Description",
        type: 1,
        date_created: "2021-10-01",
        date_modified: "2021-10-01",
      },
      {
        id: 2,
        rate: 0.08875,
        title: "NYC Sales Tax",
        description: "New York City Sales Tax",
        type: 1,
        date_created: "2021-10-01",
        date_modified: "2021-10-01",
      },
    ];

    render(
      <NewExpenseForm
        account_id={1}
        taxes={taxes}
        setShowExpenseForm={() => true}
      />
    );

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText("New Expense - Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("New Expense - Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toHaveValue("$0");

    expect(screen.getByLabelText("Tax")).toBeInTheDocument();
    expect(screen.getByText("No tax - 0%"));

    await userEvent.click(screen.getByText("No tax - 0%"));
    expect(screen.getByText("NYC Sales Tax - 8.875%")).toBeInTheDocument();
    expect(screen.getByText("Test Tax - 5%"));

    expect(screen.getByLabelText("Subsidized")).toHaveValue("0%");

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByText("New Expense - Step 3 of 4")).toBeInTheDocument();

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

    expect(screen.getByText("New Expense - Step 4 of 4")).toBeInTheDocument();

    expect(screen.getByLabelText("Expense begin date")).toHaveValue(
      dayjs().format("MM/DD/YYYY hh:mm A")
    );

    // Check that the "Expense end date" input is not checked
    expect(screen.getByLabelText("Expense end date enabled")).not.toBeChecked();

    // Check the "Expense end date" checkbox
    await userEvent.click(screen.getByLabelText("Expense end date enabled"));

    expect(screen.getByLabelText("Expense end date enabled")).toBeChecked();

    expect(screen.getByLabelText("Expense end date")).toHaveValue(
      dayjs().format("MM/DD/YYYY hh:mm A")
    );

    // Check that "Submit" button is present
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
