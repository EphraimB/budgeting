import React from "react";
import { render, screen } from "@testing-library/react";
import JobCards from "../../../components/jobs/JobCards";
import "@testing-library/jest-dom";

describe("JobCards", () => {
  it("renders", () => {
    render(<JobCards jobs={[]} account_id={1} />);

    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
