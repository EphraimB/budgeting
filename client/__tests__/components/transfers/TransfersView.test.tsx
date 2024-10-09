import React from "react";
import { render, screen } from "@testing-library/react";
import TransfersView from "../../../components/transfers/TransfersView";
import "@testing-library/jest-dom";
import { Transfer } from "@/app/types/types";

describe("TransfersView", () => {
  const setTransferModes = jest.fn();

  it("renders as source account", () => {
    const transfer: Transfer = {
      id: 1,
      sourceAccountId: 1,
      destinationAccountId: 2,
      title: "Test",
      description: "This is a test expense",
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
      dates: {
        beginDate: "2021-01-01T00:00:00.000Z",
        endDate: null,
      },
      dateCreated: "2021-10-01T00:00:00.000Z",
      dateModified: "2021-10-01T00:00:00.000Z",
    };

    render(
      <TransfersView
        accountId={1}
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

  it("renders as source account with an end date", () => {
    const transfer: Transfer = {
      id: 1,
      sourceAccountId: 1,
      destinationAccountId: 2,
      title: "Test",
      description: "This is a test expense",
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
      dates: {
        beginDate: "2021-01-01T00:00:00.000Z",
        endDate: "2022-01-01T05:00:00.000Z",
      },
      dateCreated: "2021-10-01T00:00:00.000Z",
      dateModified: "2021-10-01T00:00:00.000Z",
    };

    render(
      <TransfersView
        accountId={1}
        transfer={transfer}
        setTransferModes={setTransferModes}
      />
    );

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "$1000 will be transfered from your account on Friday December 31, 2021 7:00 PM until Saturday January 1, 2022 12:00 AM."
      )
    ).toBeInTheDocument();
  });

  it("renders as destination account", () => {
    const transfer: Transfer = {
      id: 1,
      sourceAccountId: 1,
      destinationAccountId: 2,
      title: "Test",
      description: "This is a test expense",
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
      dates: {
        beginDate: "2021-01-01T00:00:00.000Z",
        endDate: null,
      },
      dateCreated: "2021-10-01T00:00:00.000Z",
      dateModified: "2021-10-01T00:00:00.000Z",
    };

    render(
      <TransfersView
        accountId={2}
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
