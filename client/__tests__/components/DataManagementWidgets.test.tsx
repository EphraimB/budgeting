import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataManagementWidgets from "../../components/DataManagementWidgets";

jest.mock("next/navigation", () => ({
  usePathname: () => "/1/",
}));

describe("DataManagementWidgets", () => {
  it("renders", () => {
    render(
      <DataManagementWidgets
        account_id={1}
        expenses={[
          {
            account_id: 1,
            id: 1,
            tax_id: 1,
            title: "Test Expense",
            amount: 155.99,
            begin_date: "2022-01-01",
            description: "Test Description",
            frequency_type: 2,
            frequency_type_variable: null,
            frequency_day_of_month: null,
            frequency_day_of_week: null,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            subsidized: 0,
            end_date: "2022-01-01",
            next_date: "2022-01-01",
            date_created: "2022-01-01",
            date_modified: "2022-01-01",
          },
        ]}
        loans={[
          {
            account_id: 1,
            id: 1,
            recipient: "Test Recipient",
            title: "Test Loan",
            description: "Test Description",
            plan_amount: 99.99,
            amount: 999.99,
            interest_rate: 0.1,
            begin_date: "2022-01-01",
            frequency_type: 2,
            frequency_type_variable: 1,
            frequency_day_of_month: null,
            frequency_day_of_week: null,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            subsidized: 0,
            fully_paid_back: "2023-01-01",
            interest_frequency_type: 2,
            next_date: "2022-01-01",
            end_date: "2022-01-01",
            date_created: "2022-01-01",
            date_modified: "2022-01-01",
          },
        ]}
        wishlists={[
          {
            account_id: 1,
            id: 1,
            tax_id: null,
            tax_rate: 0.08875,
            wishlist_amount: 1699.0,
            wishlist_title: "iPhone 16 Pro Max",
            wishlist_description: "iPhone 16 Pro Max 1TB",
            wishlist_date_available: "2024-09-22",
            wishlist_date_can_purchase: "2024-09-22",
            wishlist_url_link: "https://www.apple.com/iphone",
            wishlist_priority: 0,
          },
        ]}
        taxes={[
          {
            id: 1,
            title: "Test Tax",
            description: "Test Description",
            type: 1,
            rate: 0.1,
            date_created: "2022-01-01",
            date_modified: "2022-01-01",
          },
        ]}
        transfers={[
          {
            id: 1,
            source_account_id: 1,
            destination_account_id: 2,
            transfer_title: "Test transfer",
            transfer_description: "Just testing transfers",
            transfer_amount: 250.0,
            transfer_begin_date: "2022-01-01",
            transfer_end_date: null,
            frequency_type: 2,
            frequency_type_variable: 1,
            frequency_day_of_month: null,
            frequency_day_of_week: null,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            next_date: "2022-02-01",
            date_created: "2022-01-01",
            date_modified: "2022-01-01",
          },
        ]}
      />
    );

    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 1 expense with a total of $171.59 including taxes and subsidies."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have 1 loan with a total of $999.99. You will be debt free Sun, 01 Jan 2023 05:00:00 GMT."
      )
    ).toBeInTheDocument();
  });
});
