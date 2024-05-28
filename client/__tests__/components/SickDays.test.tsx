import React from "react";
import { render, screen } from "@testing-library/react";
import SickDays from "../../components/SickDays";
import "@testing-library/jest-dom";

describe("VacationDays", () => {
  it("renders a vacation days box", () => {
    render(<SickDays sick_days={15} />);

    expect(screen.getByText("Sick days")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
