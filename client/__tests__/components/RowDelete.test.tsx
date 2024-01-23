import React from "react";
import { render, screen } from "@testing-library/react";
import RowDelete from "../../components/RowDelete";
import "@testing-library/jest-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

describe("RowDelete", () => {
  test("renders RowDelete component", () => {
    const row = {
      id: 1,
      title: "Test",
      description: "Just a test",
      amount: 1,
      frequency: 2,
      next_date: "2021-10-10",
      tax_id: null,
      subsidized: 0,
      account_id: 1,
    };

    const setRowModes = jest.fn();
    const handleDelete = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowDelete
            row={row}
            setRowModes={setRowModes}
            handleDelete={handleDelete}
          />
        </TableBody>
      </Table>
    );

    expect(
      screen.getByText(
        'Are you sure you want to delete this expense called "Test"?'
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
