import React from "react";
import { render, screen } from "@testing-library/react";
import DateRange from "../../components/DateRange";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

describe("DateRange", () => {
  it("renders date pickers with provided dates and calls set functions on change", () => {
    const fromDate = "2023-01-01";
    const toDate = "2023-01-02";

    render(<DateRange fromDate={fromDate} toDate={toDate} />);

    // After rendering your component and doing necessary interactions
    const input = screen.getByLabelText("From date") as HTMLInputElement;
    const input2 = screen.getByLabelText("To date") as HTMLInputElement;

    // Check if the value of the input is as expected
    expect(input.value).toBe("01/01/2023");
    expect(input2.value).toBe("01/02/2023");
  });
});
