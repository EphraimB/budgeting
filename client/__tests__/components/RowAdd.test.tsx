import React from "react";
import { render } from "@testing-library/react";
import RowAdd from "../../components/RowAdd";
import "@testing-library/jest-dom";

describe("RowAdd", () => {
  test("renders RowAdd component", () => {
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

    const setShowAddForm = jest.fn();
    const handleAdd = jest.fn();

    const { getByLabelText } = render(
      <RowAdd
        account_id={1}
        taxes={[]}
        setShowAddForm={setShowAddForm}
        handleAdd={handleAdd}
      />
    );

    expect(getByLabelText("Title")).toBeInTheDocument();
    expect(getByLabelText("Description")).toBeInTheDocument();
    expect(getByLabelText("Amount")).toBeInTheDocument();
    expect(getByLabelText("Frequency")).toBeInTheDocument();
    expect(getByLabelText("Expense begin date")).toBeInTheDocument();
    expect(getByLabelText("Tax")).toBeInTheDocument();
    expect(getByLabelText("Subsidized")).toBeInTheDocument();
    expect(getByLabelText("Account")).toBeInTheDocument();
    expect(getByLabelText("Add")).toBeInTheDocument();
    expect(getByLabelText("Cancel")).toBeInTheDocument();
  });
});
