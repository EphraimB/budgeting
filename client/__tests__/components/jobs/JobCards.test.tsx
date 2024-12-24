import React from "react";
import { render, screen } from "@testing-library/react";
import JobCards from "../../../components/jobs/JobCards";
import "@testing-library/jest-dom";

jest.mock("../../../services/actions/job", () => ({
  editJob: jest.fn(),
}));

describe("JobCards", () => {
  it("renders", () => {
    render(<JobCards jobs={[]} accountId={1} />);

    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
