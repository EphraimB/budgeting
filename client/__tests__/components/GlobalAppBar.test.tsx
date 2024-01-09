import React from "react";
import { render, screen } from "@testing-library/react";
import GlobalAppBar from "../../components/GlobalAppBar";
import "@testing-library/jest-dom";

describe("GlobalAppBar", () => {
  it('renders with the title "Budgeting"', () => {
    render(<GlobalAppBar />);

    expect(screen.getByText("Budgeting")).toBeInTheDocument();
  });
});
