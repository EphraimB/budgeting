import React from "react";
import { render, screen } from "@testing-library/react";
import RowView from "../../components/RowView";
import "@testing-library/jest-dom";
import { Table, TableBody } from "@mui/material";
import { getFrequency } from "../../utils/helperFunctions";

describe("RowView", () => {
  test("renders RowView component", () => {
    const row = {
      id: 1,
      title: "Test",
      description: "Just a test",
      amount: 1,
      frequency_type: 2,
      frequency_type_variable: 1,
      begin_date: "2021-10-10",
      next_date: "2021-11-10",
      tax_id: null,
      subsidized: 0,
      account_id: 1,
    };

    const index = 1;
    const handleClick = jest.fn();
    const isSelected = jest.fn();
    const taxes = [
      {
        tax_id: 1,
        tax_rate: 1,
      },
    ];

    render(
      <Table>
        <TableBody>
          <RowView
            row={row}
            index={index}
            handleClick={handleClick}
            isSelected={isSelected}
            taxes={taxes}
            getExpenseFrequency={getFrequency}
            type={0}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Just a test")).toBeInTheDocument();
    expect(screen.getByText("$1.00")).toBeInTheDocument();
    expect(screen.getByText("Monthly on the 10th")).toBeInTheDocument();
  });
});
