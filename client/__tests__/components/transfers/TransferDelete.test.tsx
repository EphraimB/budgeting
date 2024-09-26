import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransferDelete from "../../../components/transfers/TransferDelete";
import { Transfer } from "@/app/types/types";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("TransferDelete", () => {
  it("renders the component", () => {
    const transfer: Transfer = {
      sourceAccountId: 1,
      destinationAccountId: 2,
      id: 1,
      title: "Test Transfer",
      amount: 155.99,
      description: "Test Description",
      frequency: {
        type: 2,
        typeVariable: 1,
        dayOfMonth: null,
        dayOfWeek: null,
        weekOfMonth: null,
        monthOfYear: null,
      },
      dates: {
        beginDate: "2021-10-01",
        endDate: null,
      },
      nextDate: "2021-11-01",
      dateCreated: "2021-10-01",
      dateModified: "2021-10-01",
    };

    render(<TransferDelete transfer={transfer} setTransferModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Transfer"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
