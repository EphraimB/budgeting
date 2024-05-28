import React from "react";
import { render, screen } from "@testing-library/react";
import VacationDays from "../../components/VacationDays";
import "@testing-library/jest-dom";

describe("VacationDays", () => {
  it("renders a vacation days box", () => {
    render(<VacationDays vacation_days={15} />);

    expect(screen.getByText("Vacation days")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
