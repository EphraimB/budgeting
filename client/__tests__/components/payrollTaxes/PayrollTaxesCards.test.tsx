import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import PayrollTaxesCards from "../../../components/payrollTaxes/PayrollTaxesCards";
import { Job, PayrollTax } from "@/app/types/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("PayrollTaxesCards", () => {
  it("renders payroll taxes cards with provided payroll taxes", () => {
    const job: Job = {
      id: 1,
      account_id: 1,
      name: "Testing Inc.",
      hourly_rate: 16,
      vacation_days: 15,
      sick_days: 15,
      total_hours_per_week: 8,
      job_schedule: [],
    };

    const payroll_taxes: PayrollTax[] = [
      {
        id: 1,
        job_id: 1,
        name: "Social Security",
        rate: 0.02,
      },
      {
        id: 2,
        job_id: 1,
        name: "Medicare",
        rate: 0.01,
      },
    ];

    render(<PayrollTaxesCards job={job} payroll_taxes={payroll_taxes} />);

    expect(screen.getByText("Payroll taxes for Testing Inc."));
    expect(
      screen.getByText("All 2 of your payroll taxes take 3% of your payroll")
    );

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
