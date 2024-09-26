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
        accountId={1}
        accounts={[
          {
            id: 1,
            name: "Testing account 1",
            balance: 50,
            dateCreated: "2020-01-01",
            dateModified: "2020-01-01",
          },
          {
            id: 2,
            name: "Testing account 2",
            balance: 100,
            dateCreated: "2020-01-01",
            dateModified: "2020-01-01",
          },
        ]}
        expenses={[
          {
            accountId: 1,
            id: 1,
            taxId: 1,
            title: "Test Expense",
            amount: 155.99,
            dates: {
              beginDate: "2022-01-01",
              endDate: "2022-01-01",
            },
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
            nextDate: "2022-01-01",
            dateCreated: "2022-01-01",
            dateModified: "2022-01-01",
          },
        ]}
        loans={[
          {
            accountId: 1,
            id: 1,
            recipient: "Test Recipient",
            title: "Test Loan",
            description: "Test Description",
            planAmount: 99.99,
            amount: 999.99,
            interestRate: 0.1,
            dates: {
              beginDate: "2022-01-01",
              endDate: "2022-01-01",
            },
            frequency: {
              type: 2,
              typeVariable: 1,
              dayOfMonth: null,
              dayOfWeek: null,
              weekOfMonth: null,
              monthOfYear: null,
            },
            subsidized: 0,
            fullyPaidBackDate: "2023-01-01",
            interestFrequencyType: 2,
            nextDate: "2022-01-01",
            dateCreated: "2022-01-01",
            dateModified: "2022-01-01",
          },
        ]}
        wishlists={[
          {
            accountId: 1,
            id: 1,
            taxId: null,
            taxRate: 0.08875,
            amount: 1699.0,
            title: "iPhone 16 Pro Max",
            description: "iPhone 16 Pro Max 1TB",
            dateAvailable: "2024-09-22",
            dateCanPurchase: "2024-09-22",
            urlLink: "https://www.apple.com/iphone",
            priority: 0,
          },
        ]}
        taxes={[
          {
            id: 1,
            title: "Test Tax",
            description: "Test Description",
            type: 1,
            rate: 0.1,
            dateCreated: "2022-01-01",
            dateModified: "2022-01-01",
          },
        ]}
        transfers={[
          {
            id: 1,
            sourceAccountId: 1,
            destinationAccountId: 2,
            title: "Test transfer",
            description: "Just testing transfers",
            amount: 250.0,
            dates: {
              beginDate: "2022-01-01",
              endDate: null,
            },
            frequency: {
              type: 2,
              typeVariable: 1,
              dayOfMonth: null,
              dayOfWeek: null,
              weekOfMonth: null,
              monthOfYear: null,
            },
            nextDate: "2022-02-01",
            dateCreated: "2022-01-01",
            dateModified: "2022-01-01",
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
