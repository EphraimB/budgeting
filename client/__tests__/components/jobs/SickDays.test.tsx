import React from "react";
import { render, screen } from "@testing-library/react";
import SickDays from "../../../components/jobs/SickDays";
import "@testing-library/jest-dom";

describe("SickDays", () => {
  it("renders a sick days box", () => {
    render(<SickDays sick_days={15} />);

    expect(screen.getByText("Sick days")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
