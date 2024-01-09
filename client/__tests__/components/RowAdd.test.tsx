import React from "react";
import { render, getByTestId } from "@testing-library/react";
import RowAdd from "../../components/RowAdd";
import "@testing-library/jest-dom";
import { Table, TableBody } from "@mui/material";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";

describe("RowAdd", () => {
  it("renders RowAdd component", () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    const { getByLabelText, getByText } = render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
          />
        </TableBody>
      </Table>
    );

    expect(getByLabelText("Title")).toBeInTheDocument();
    expect(getByLabelText("Description")).toBeInTheDocument();
    expect(getByLabelText("Amount")).toBeInTheDocument();
    expect(getByLabelText("Frequency")).toBeInTheDocument();
    expect(getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(getByLabelText("Tax")).toBeInTheDocument();
    expect(getByLabelText("Subsidized")).toBeInTheDocument();
    expect(getByText("Add expense")).toBeInTheDocument();
    expect(getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowAdd component with taxes", () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    const { getByLabelText, getByText, getByDisplayValue } = render(
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
          />
        </TableBody>
      </Table>
    );

    expect(getByLabelText("Title")).toBeInTheDocument();
    expect(getByLabelText("Description")).toBeInTheDocument();
    expect(getByLabelText("Amount")).toBeInTheDocument();
    expect(getByLabelText("Frequency")).toBeInTheDocument();
    expect(getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(getByLabelText("Tax")).toBeInTheDocument();
    expect(getByDisplayValue("1")).toBeInTheDocument();
    expect(getByLabelText("Subsidized")).toBeInTheDocument();
    expect(getByText("Add expense")).toBeInTheDocument();
    expect(getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowAdd component with end date checked", () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    const { getByLabelText, getByText } = render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
          />
        </TableBody>
      </Table>
    );

    // Check end date
    const endDate = getByLabelText("Expense end date");
    expect(endDate).toBeInTheDocument();
    expect(endDate).not.toBeChecked();

    act(() => {
      endDate.click();
    });

    expect(endDate).toBeChecked();

    expect(getByLabelText("Title")).toBeInTheDocument();
    expect(getByLabelText("Description")).toBeInTheDocument();
    expect(getByLabelText("Amount")).toBeInTheDocument();
    expect(getByLabelText("Frequency")).toBeInTheDocument();
    expect(getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(getByLabelText("Tax")).toBeInTheDocument();
    expect(getByLabelText("Subsidized")).toBeInTheDocument();
    expect(getByText("Add expense")).toBeInTheDocument();
    expect(getByText("Cancel")).toBeInTheDocument();
  });

  it("renders RowAdd component with frequency daily", async () => {
    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    const {
      getByLabelText,
      getByText,
      getByTestId,
      getByRole,
      findByRole,
      findByText,
    } = render(
      <Table>
        <TableBody>
          <RowAdd
            account_id={1}
            taxes={[]}
            setShowAddForm={setShowAddForm}
            handleAdd={handleAdd}
          />
        </TableBody>
      </Table>
    );

    const dropdownButton = getByRole("button", { name: /Frequency​/i });

    userEvent.click(dropdownButton);

    const typographyEl = await findByText(/Daily/i);

    expect(typographyEl).toBeInTheDocument();

    // // Check frequency
    // const frequency = getByTestId("frequency-select");
    // expect(frequency).toBeInTheDocument();

    // console.log(frequency);

    // expect(getByLabelText("Day of week")).toBeInTheDocument();

    // act(() => {
    //   // Change frequency to daily
    //   userEvent.change(frequency, { target: { value: "0" } });
    // });

    expect(getByLabelText("Week of month")).toBeInTheDocument();

    expect(getByLabelText("Title")).toBeInTheDocument();
    expect(getByLabelText("Description")).toBeInTheDocument();
    expect(getByLabelText("Amount")).toBeInTheDocument();
    expect(getByLabelText("Frequency")).toBeInTheDocument();
    expect(getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(getByLabelText("Tax")).toBeInTheDocument();
    expect(getByLabelText("Subsidized")).toBeInTheDocument();
    expect(getByText("Add expense")).toBeInTheDocument();
    expect(getByText("Cancel")).toBeInTheDocument();
  });
});
