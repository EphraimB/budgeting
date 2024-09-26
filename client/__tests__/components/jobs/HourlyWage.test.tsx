import React from "react";
import { render, screen } from "@testing-library/react";
import HourlyWage from "../../../components/jobs/HourlyWage";
import "@testing-library/jest-dom";

describe("HourlyWage", () => {
  it("renders an hourly wage box", () => {
    render(<HourlyWage hourlyWage={16} />);

    expect(screen.getByText("Hourly Wage")).toBeInTheDocument();
    expect(screen.getByText("$16.00")).toBeInTheDocument();
  });
});
