import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import IncomeDelete from "../../../components/incomes/IncomeDelete";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../../services/actions/income", () => ({
  deleteIncome: jest.fn(),
}));

describe("IncomeDelete", () => {
  it("renders the component", () => {
    const income = {
      accountId: 1,
      id: 1,
      taxId: 1,
      title: "Test Income",
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
      subsidized: 0,
      dates: {
        beginDate: "2021-10-01",
        endDate: null,
      },
      nextDate: null,
      dateCreated: "2021-10-01",
      dateModified: "2021-10-01",
    };

    render(<IncomeDelete income={income} setIncomeModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "Test Income"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
