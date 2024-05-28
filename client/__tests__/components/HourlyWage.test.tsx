import React from "react";
import { render, screen } from "@testing-library/react";
import HourlyWage from "../../components/HourlyWage";
import "@testing-library/jest-dom";

describe("HourlyWage", () => {
  it("renders an hourly wage box", () => {
    render(<HourlyWage hourly_wage={16} />);

    expect(screen.getByText("Hourly Wage")).toBeInTheDocument();
    expect(screen.getByText("$16.00")).toBeInTheDocument();
  });
});
