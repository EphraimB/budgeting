import React from "react";
import { render, screen } from "@testing-library/react";
import LoansWidget from "../../components/LoansWidget";
import "@testing-library/jest-dom";

describe("LoansWidget", () => {
  it("renders LoansWidget component", () => {
    render(<LoansWidget account_id={1} />);

    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("View and manage your loans.")).toBeInTheDocument();
  });
});
