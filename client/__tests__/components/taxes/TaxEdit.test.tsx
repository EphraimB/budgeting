import React from "react";
import { render, screen } from "@testing-library/react";
import TaxEdit from "../../../components/taxes/TaxEdit";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    showAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("TaxEdit", () => {
  it("renders TaxEdit form component", async () => {
    const tax = {
      id: 1,
      rate: 0.08875,
      title: "NYC Sales Tax",
      description: "New York City Sales Tax",
      type: 1,
      date_created: "2021-10-01",
      date_modified: "2021-10-01",
    };

    render(<TaxEdit tax={tax} setTaxModes={() => {}} />);

    expect(screen.getByLabelText("close")).toBeInTheDocument();

    expect(screen.getByText("Edit Tax - Step 1 of 2")).toBeInTheDocument();

    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toHaveValue("NYC Sales Tax");

    expect(screen.getByLabelText("Description")).toHaveValue(
      "New York City Sales Tax"
    );

    // Go to the next step by clicking the "Next" button
    await userEvent.click(screen.getByText("Next"));

    expect(screen.getByLabelText("Rate")).toHaveValue(8.875);
    expect(screen.getByLabelText("Type")).toHaveValue("1");

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });
});
