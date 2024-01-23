import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RowAdd from "../../components/RowAdd";
import "@testing-library/jest-dom";
import { Table, TableBody } from "@mui/material";
import { act } from "react-dom/test-utils";

describe("RowAdd", () => {
  it("renders RowAdd component", () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
            type={0}
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
    expect(screen.getByText("Add expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowAdd component with taxes", () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[
              {
                id: 1,
                title: "IVA",
                rate: 0.05,
                account_id: 1,
              },
            ]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
            type={0}
          />
        </TableBody>
      </Table>
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
    expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
    expect(screen.getByText("Add expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowAdd component with end date checked", () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
            type={0}
          />
        </TableBody>
      </Table>
    );

    // Check end date
    const endDate = screen.getByLabelText("Expense end date");
    expect(endDate).toBeInTheDocument();
    expect(endDate).not.toBeChecked();

    act(() => {
      endDate.click();
    });

    expect(endDate).toBeChecked();

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
    expect(screen.getByText("Add expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowAdd component with frequency daily", async () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
            type={0}
          />
        </TableBody>
      </Table>
    );

    const selectElement = screen.getByLabelText("Frequency");
    fireEvent.mouseDown(selectElement);

    const dailyOption = screen.getByTestId("daily-menu-item");
    fireEvent.click(dailyOption);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
    expect(screen.getByText("Add expense")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});

it("renders RowAdd component with frequency weekly", async () => {
  const setShowAddForm = jest.fn();
  const handleAdd = jest.fn();

  render(
    <Table>
      <TableBody>
        <RowAdd
          account_id={1}
          taxes={[]}
          setShowAddForm={setShowAddForm}
          handleAdd={handleAdd}
          type={0}
        />
      </TableBody>
    </Table>
  );

  const selectElement = screen.getByLabelText("Frequency");
  fireEvent.mouseDown(selectElement);

  const dailyOption = screen.getByTestId("weekly-menu-item");
  fireEvent.click(dailyOption);

  expect(screen.getByLabelText("Title")).toBeInTheDocument();
  expect(screen.getByLabelText("Description")).toBeInTheDocument();
  expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
  expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
  expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
  expect(screen.getByText("Add expense")).toBeInTheDocument();
  expect(screen.getByText("Cancel")).toBeInTheDocument();
});

it("renders RowAdd component with frequency yearly", async () => {
  const setShowAddForm = jest.fn();
  const handleAdd = jest.fn();

  render(
    <Table>
      <TableBody>
        <RowAdd
          account_id={1}
          taxes={[]}
          setShowAddForm={setShowAddForm}
          handleAdd={handleAdd}
          type={0}
        />
      </TableBody>
    </Table>
  );

  const selectElement = screen.getByLabelText("Frequency");
  fireEvent.mouseDown(selectElement);

  const dailyOption = screen.getByTestId("yearly-menu-item");
  fireEvent.click(dailyOption);

  expect(screen.getByLabelText("Title")).toBeInTheDocument();
  expect(screen.getByLabelText("Description")).toBeInTheDocument();
  expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  expect(screen.getByLabelText("Expense begin date")).toBeInTheDocument();
  expect(screen.getByLabelText("Subsidized")).toBeInTheDocument();
  expect(screen.getByLabelText("Day of week")).toBeInTheDocument();
  expect(screen.getByLabelText("Week of month")).toBeInTheDocument();
  expect(screen.getByLabelText("Month of year")).toBeInTheDocument();
  expect(screen.getByText("Add expense")).toBeInTheDocument();
  expect(screen.getByText("Cancel")).toBeInTheDocument();
});
