import React from "react";
import { render, screen } from "@testing-library/react";
import RowEdit from "../../components/RowEdit";
import "@testing-library/jest-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";

describe("RowEdit", () => {
  const setRowModes = jest.fn();
  const handleEdit = jest.fn();

  it("renders RowEdit component with monthly frequency", () => {
    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[
              {
                id: 1,
                title: "GST",
                description: "Goods and Services Tax",
                rate: 0.05,
                type: 0,
                date_created: "2021-10-01T00:00:00.000Z",
                date_modified: "2021-10-01T00:00:00.000Z",
              },
              {
                id: 2,
                title: "PST",
                description: "Provincial Sales Tax",
                rate: 0.07,
                type: 0,
                date_created: "2021-10-01T00:00:00.000Z",
                date_modified: "2021-10-01T00:00:00.000Z",
              },
            ]}
            type={0}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 2,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: 0,
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

    // Click on the tax select
    act(() => {
      userEvent.click(screen.getByLabelText("Tax"));
    });

    // expect(screen.getByText("GST - 5%")).toBeInTheDocument();
    // expect(screen.getByText("PST - 7%")).toBeInTheDocument();

    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with weekly frequency", () => {
    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            taxes={[]}
            type={0}
            row={{
              id: 1,
              title: "Weekly test",
              description: "Weekly test",
              amount: 1000,
              frequency_type: 1,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: 0,
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
    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with daily frequency", () => {
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
              subsidized: 0,
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

  it("renders RowEdit component with yearly frequency", () => {
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
              subsidized: 0,
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
    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
    expect(screen.getByLabelText("Month of year")).toBeInTheDocument();
    expect(screen.getByText("Update expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowEdit component with no taxes", async () => {
    render(
      <Table>
        <TableBody>
          <RowEdit
            account_id={1}
            type={1}
            row={{
              id: 1,
              title: "Rent",
              description: "Monthly rent",
              amount: 1000,
              frequency_type: 0,
              frequency: 0,
              expense_begin_date: "2021-10-01",
              subsidized: 0,
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
});
