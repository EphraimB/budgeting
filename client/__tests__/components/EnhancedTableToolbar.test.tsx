import React from "react";
import { render, screen } from "@testing-library/react";
import EnhancedTableToolbar from "../../components/EnhancedTableToolbar";
import "@testing-library/jest-dom";

describe("EnhancedTableToolbar", () => {
  it("renders table toolbar with provided name", () => {
    const name = "Test name";
    render(
      <EnhancedTableToolbar
        numSelected={0}
        name={name}
        showAddExpenseForm={false}
        selectedRows={[]}
        rowModes={{}}
        setRowModes={() => {}}
        setShowAddExpenseForm={() => {}}
      />
    );

    expect(screen.getByText(name)).toBeInTheDocument();
  });

  it("renders table toolbar with provided numSelected", () => {
    const numSelected = 1;
    render(
      <EnhancedTableToolbar
        numSelected={numSelected}
        name={""}
        showAddExpenseForm={false}
        selectedRows={[]}
        rowModes={{}}
        setRowModes={() => {}}
        setShowAddExpenseForm={() => {}}
      />
    );

    expect(screen.getByText(`${numSelected} selected`)).toBeInTheDocument();
  });

  it("renders table toolbar with provided showAddExpenseForm", () => {
    const showAddExpenseForm = true;
    const { getByLabelText } = render(
      <EnhancedTableToolbar
        numSelected={0}
        name={""}
        showAddExpenseForm={showAddExpenseForm}
        selectedRows={[]}
        rowModes={{}}
        setRowModes={() => {}}
        setShowAddExpenseForm={() => {}}
      />
    );

    expect(getByLabelText("Close")).toBeInTheDocument();
  });

  it("renders table toolbar with provided selectedRows", () => {
    const selectedRows = [{ id: 1, name: "Test" }];
    const { getByLabelText } = render(
      <EnhancedTableToolbar
        numSelected={1}
        name={""}
        showAddExpenseForm={false}
        selectedRows={selectedRows}
        rowModes={{}}
        setRowModes={() => {}}
        setShowAddExpenseForm={() => {}}
      />
    );

    expect(getByLabelText("Edit")).toBeInTheDocument();
    expect(getByLabelText("Delete")).toBeInTheDocument();
  });
});
