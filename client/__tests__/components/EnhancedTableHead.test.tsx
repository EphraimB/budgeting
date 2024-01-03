import React from "react";
import { render } from "@testing-library/react";
import EnhancedTableHead from "../../components/EnhancedTableHead";
import { Table } from "@mui/material";
import "@testing-library/jest-dom";

describe("EnhancedTableHead", () => {
  it("renders table head cells with provided headCells", () => {
    const headCells = [
      { id: "name", label: "Name", numeric: false },
      { id: "amount", label: "Amount", numeric: true },
      { id: "date", label: "Date", numeric: false },
    ];

    const { getByText } = render(
      <Table>
        <EnhancedTableHead
          numSelected={0}
          onRequestSort={() => {}}
          onSelectAllClick={() => {}}
          order={"asc"}
          orderBy={"name"}
          rowCount={0}
          headCells={headCells}
        />
      </Table>
    );

    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Amount")).toBeInTheDocument();
    expect(getByText("Date")).toBeInTheDocument();
  });
});
