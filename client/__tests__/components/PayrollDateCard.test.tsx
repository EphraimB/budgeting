import React from "react";
import { render, screen } from "@testing-library/react";
import PayrollDateCard from "../../components/PayrollDateCard";
import "@testing-library/jest-dom";
import { PayrollDate } from "@/app/types/types";

jest.mock("../../context/FeedbackContext", () => ({
  useAlert: () => ({
    alert: () => {},
    closeAlert: () => {},
  }),
  useSnackbar: () => ({
    showSnackbar: () => {},
  }),
}));

describe("PayrollDateCard", () => {
  const payroll_date: PayrollDate = {
    id: 1,
    job_id: 1,
    payroll_day: 15,
  };

  it("renders a box which is not a payroll day", () => {
    render(<PayrollDateCard job_id={1} payroll_date={null} date={1} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders a box which is a payroll day", () => {
    render(
      <PayrollDateCard job_id={1} payroll_date={payroll_date} date={15} />
    );

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
  });
});
