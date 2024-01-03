import React from "react";
import { render } from "@testing-library/react";
import RowDelete from "../../components/RowDelete";
import "@testing-library/jest-dom";

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

    const { getByText } = render(
      <RowDelete
        row={row}
        setRowModes={setRowModes}
        handleDelete={handleDelete}
      />
    );

    expect(
      getByText('Are you sure you want to delete this expense called "Test"?')
    ).toBeInTheDocument();
    expect(getByText("Delete")).toBeInTheDocument();
    expect(getByText("Cancel")).toBeInTheDocument();
  });
});
