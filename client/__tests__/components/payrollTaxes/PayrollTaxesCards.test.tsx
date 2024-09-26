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
      accountId: 1,
      name: "Testing Inc.",
      hourlyRate: 16,
      totalHoursPerWeek: 8,
      jobSchedule: [],
    };

    const payrollTaxes: PayrollTax[] = [
      {
        id: 1,
        jobId: 1,
        name: "Social Security",
        rate: 0.02,
      },
      {
        id: 2,
        jobId: 1,
        name: "Medicare",
        rate: 0.01,
      },
    ];

    render(<PayrollTaxesCards job={job} payrollTaxes={payrollTaxes} />);

    expect(screen.getByText("Payroll taxes for Testing Inc."));
    expect(
      screen.getByText("All 2 of your payroll taxes take 3% of your payroll")
    );

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
