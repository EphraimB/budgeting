import React from "react";
import { render, screen } from "@testing-library/react";
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

    render(
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

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
  });
});
