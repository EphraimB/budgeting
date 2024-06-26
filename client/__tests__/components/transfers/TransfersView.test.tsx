import React from "react";
import { render, screen } from "@testing-library/react";
import TransfersView from "../../../components/transfers/TransfersView";
import "@testing-library/jest-dom";
import { Transfer } from "@/app/types/types";

describe("TransfersView", () => {
  const setTransferModes = jest.fn();

  const transfer: Transfer = {
    id: 1,
    source_account_id: 1,
    destination_account_id: 2,
    transfer_title: "Test",
    transfer_description: "This is a test expense",
    transfer_amount: 1000,
    next_date: "2022-01-01T00:00:00.000Z",
    frequency_day_of_month: null,
    frequency_day_of_week: null,
    frequency_type: 2,
    frequency_type_variable: 1,
    frequency_week_of_month: null,
    frequency_month_of_year: null,
    transfer_begin_date: "2021-01-01T00:00:00.000Z",
    transfer_end_date: null,
    date_created: "2021-10-01T00:00:00.000Z",
    date_modified: "2021-10-01T00:00:00.000Z",
  };

  it("renders as source account", () => {
    render(
      <TransfersView
        account_id={1}
        transfer={transfer}
        setTransferModes={setTransferModes}
      />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "$1000 will be transfered from your account on Friday December 31, 2021 7:00 PM."
      )
    ).toBeInTheDocument();
  });

  it("renders as destination account", () => {
    render(
      <TransfersView
        account_id={2}
        transfer={transfer}
        setTransferModes={setTransferModes}
      />
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "$1000 will be transfered to your account on Friday December 31, 2021 7:00 PM."
      )
    ).toBeInTheDocument();
  });
});
