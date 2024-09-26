import React from "react";
import { render, screen } from "@testing-library/react";
import TaxView from "../../../components/taxes/TaxView";
import "@testing-library/jest-dom";
import { Tax } from "@/app/types/types";

describe("TaxView", () => {
  const setTaxModes = jest.fn();

  const tax: Tax = {
    id: 1,
    title: "NYC sales tax",
    description: "NYC sales tax",
    rate: 0.08875,
    type: 0,
    dateCreated: "2022-12-31",
    dateModified: "2022-12-31",
  };

  it("renders", () => {
    render(<TaxView tax={tax} setTaxModes={setTaxModes} />);

    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
    expect(screen.getByText("Your tax rate is 8.875%")).toBeInTheDocument();
  });
});
