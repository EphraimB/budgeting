import React from "react";
import { render } from "@testing-library/react";
import GlobalAppBar from "../../components/GlobalAppBar";
import "@testing-library/jest-dom";

describe("GlobalAppBar", () => {
  it('renders with the title "Budgeting"', () => {
    const { getByText } = render(<GlobalAppBar />);

    expect(getByText("Budgeting")).toBeInTheDocument();
  });
});
