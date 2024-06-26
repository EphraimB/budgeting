import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransferDelete from "../../../components/transfers/TransferDelete";
import { Transfer } from "@/app/types/types";

jest.mock("../../context/FeedbackContext", () => ({
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

    render(<TransferDelete transfer={transfer} setTransferModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Transfer"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
