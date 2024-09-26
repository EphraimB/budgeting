import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollDateCard from "../../../components/payrollDates/PayrollDateCard";
import "@testing-library/jest-dom";
import { PayrollDate } from "@/app/types/types";

jest.mock("../../../context/FeedbackContext", () => ({
  useAlert: () => ({
    alert: () => {},
    closeAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("PayrollDateCard", () => {
  const payrollDate: PayrollDate = {
    id: 1,
    jobId: 1,
    payrollDay: 15,
  };

  it("renders a box which is not a payroll day", () => {
    render(<PayrollDateCard jobId={1} payrollDate={null} date={1} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders a box which is a payroll day", () => {
    render(<PayrollDateCard jobId={1} payrollDate={payrollDate} date={15} />);

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
  });
});
