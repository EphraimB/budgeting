import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DateRange from "../components/DateRange";
import dayjs from "dayjs";

describe("DateRange", () => {
  it("renders date pickers with provided dates and calls set functions on change", () => {
    const fromDate = dayjs("2023-01-01T12:00:00");
    const toDate = dayjs("2023-01-02T12:00:00");

    const setFromDate = jest.fn();
    const setToDate = jest.fn();

    const { getByLabelText } = render(
      <DateRange
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />
    );

    // Check if the date pickers have the correct initial value
    expect(getByLabelText("From date").value).toBe("01/01/2023 12:00 PM");
    expect(getByLabelText("To date").value).toBe("01/02/2023 12:00 PM");

    // Simulate changing the fromDate (this will be more pseudo-simulation due to MUI pickers complexity)
    fireEvent.change(getByLabelText("From date"), {
      target: { value: "1/2/2023 1:00 PM" },
    });
    expect(setFromDate).toHaveBeenCalled();

    // Simulate changing the toDate
    fireEvent.change(getByLabelText("To date"), {
      target: { value: "1/3/2023 1:00 PM" },
    });
    expect(setToDate).toHaveBeenCalled();
  });
});
