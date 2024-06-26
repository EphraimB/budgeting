import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TaxDelete from "../../../components/taxes/TaxDelete";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("TaxDelete", () => {
  it("renders the component", () => {
    const tax = {
      id: 1,
      rate: 0.08875,
      title: "NYC Sales Tax",
      description: "New York City Sales Tax",
      type: 1,
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(<TaxDelete tax={tax} setTaxModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();
    expect(screen.getByText('Delete "NYC Sales Tax"?')).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
