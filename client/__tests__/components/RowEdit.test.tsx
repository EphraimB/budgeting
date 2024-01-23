import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RowEdit from "../../components/RowEdit";
import "@testing-library/jest-dom";
import { Table, TableBody } from "@mui/material";
import { act } from "react-dom/test-utils";

describe("RowEdit", () => {
  it("renders RowEdit component with monthly frequency", () => {
    const setRowModes = jest.fn();
    const handleEdit = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[]}
            type={0}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 2,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: false,
              day_of_week: null,
              week_of_month: null,
              account_id: 1,
            }}
            setRowModes={setRowModes}
            handleEdit={handleEdit}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with weekly frequency", () => {
    const setRowModes = jest.fn();
    const handleEdit = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[]}
            type={0}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 1,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: false,
              day_of_week: null,
              week_of_month: null,
              account_id: 1,
            }}
            setRowModes={setRowModes}
            handleEdit={handleEdit}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with daily frequency", () => {
    const setRowModes = jest.fn();
    const handleEdit = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[]}
            type={0}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 0,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: false,
              day_of_week: null,
              week_of_month: null,
              account_id: 1,
            }}
            setRowModes={setRowModes}
            handleEdit={handleEdit}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with yearly frequency", () => {
    const setRowModes = jest.fn();
    const handleEdit = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[]}
            type={0}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 3,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: false,
              day_of_week: null,
              week_of_month: null,
              account_id: 1,
            }}
            setRowModes={setRowModes}
            handleEdit={handleEdit}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
    expect(screen.getByLabelText("Month of year")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with type 2", () => {
    const setRowModes = jest.fn();
    const handleEdit = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[
              {
                id: 1,
                name: "GST",
                rate: 5,
                account_id: 1,
              },
              {
                id: 2,
                name: "PST",
                rate: 7,
                account_id: 1,
              },
            ]}
            type={2}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 0,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: false,
              day_of_week: null,
              week_of_month: null,
              account_id: 1,
            }}
            setRowModes={setRowModes}
            handleEdit={handleEdit}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax")).toBeInTheDocument();
    expect(screen.getByText("None - 0%")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
