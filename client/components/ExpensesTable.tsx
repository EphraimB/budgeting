"use client";

import { useState, Suspense, useMemo } from "react";
import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import EnhancedTableHead from "../components/EnhancedTableHead";
import EnhancedTableToolbar from "../components/EnhancedTableToolbar";
import dayjs from "dayjs";
import {
  getComparator,
  stableSort,
  type Order,
} from "../utils/helperFunctions";
import RowView from "./RowView";
import RowDelete from "./RowDelete";
import Loading from "../src/app/[account_id]/expenses/loading";
import RowEdit from "./RowEdit";
import RowAdd from "./RowAdd";

interface Expense {
  expense_id: number;
  account_id: number;
  tax_id: number;
  expense_amount: number;
  expense_title: string;
  expense_description: string;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_month: number;
  frequency_day_of_week: number;
  frequency_week_of_month: number;
  frequency_month_of_year: number;
  expense_subsidized: number;
  expense_begin_date: string;
  expense_end_date: string | null;
  date_created: string;
  date_modified: string;
}

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "expense_title",
    numeric: false,
    label: "Title",
  },
  {
    id: "expense_description",
    numeric: false,
    label: "Description",
  },
  {
    id: "expense_amount",
    numeric: false,
    label: "Amount ($)",
  },
  {
    id: "next_expense_date",
    numeric: false,
    label: "Next expense date",
  },
  {
    id: "expense_frequency",
    numeric: false,
    label: "Expense frequency",
  },
];

function ExpensesTable({
  expenses,
  taxes,
}: {
  expenses: Expense[];
  taxes: any[];
}) {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("expense_title");
  const [selected, setSelected] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rowModes, setRowModes] = useState<Record<number, string>>({});
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = expenses.map((n: Expense) => n);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, expense: Expense) => {
    const selectedIndex = selected.findIndex(
      (e) => e.expense_id === expense.expense_id
    );
    let newSelected: Expense[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, expense];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (expenseId: number) =>
    selected.some((expense) => expense.expense_id === expenseId);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - expenses.length) : 0;

  const visibleRows = useMemo(() => {
    return stableSort(expenses as any[], getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [expenses, order, orderBy, page, rowsPerPage]);

  const getNextExpenseDateAndFrequency = (expense: any) => {
    const currentDate = new Date(expense.expense_begin_date);
    let nextExpenseDate;
    let expenseFrequency;

    switch (expense.frequency_type) {
      case 0: // Daily
        if (
          expense.frequency_type_variable === 1 ||
          expense.frequency_type_variable === null
        )
          expenseFrequency = "Daily";
        else
          expenseFrequency =
            "Every " + expense.frequency_type_variable + " days";

        currentDate.setDate(
          currentDate.getDate() + expense.frequency_type_variable
        );
        nextExpenseDate = currentDate;
        break;
      case 1: // Weekly
        if (
          expense.frequency_type_variable === 1 ||
          expense.frequency_type_variable === null
        )
          expenseFrequency = `Weekly on ${dayjs(
            expense.expense_begin_date
          ).format("dddd")}`;
        else {
          expenseFrequency =
            "Every " +
            expense.frequency_type_variable +
            " weeks on " +
            dayjs(expense.expense_begin_date).format("dddd");
        }

        currentDate.setDate(
          currentDate.getDate() + 7 * expense.frequency_type_variable
        );
        nextExpenseDate = currentDate;
        break;
      case 2: // Monthly
        if (
          expense.frequency_type_variable === 1 ||
          expense.frequency_type_variable === null
        ) {
          expenseFrequency = `Monthly on the ${dayjs(
            expense.expense_begin_date
          ).format("DD")}th`;
        } else {
          expenseFrequency = `Every ${
            expense.frequency_type_variable
          } months on the ${dayjs(expense.expense_begin_date).format("DD")}th`;
        }

        if (expense.frequency_day_of_month) {
          expenseFrequency = `Monthly on the ${expense.frequency_day_of_month}`;
        } else if (expense.frequency_day_of_week) {
          expenseFrequency = `Monthly on the ${
            expense.frequency_week_of_month
          } ${dayjs(expense.frequency_day_of_week).format("dddd")}`;
        }

        if (expense.frequency_day_of_month) {
          currentDate.setMonth(
            currentDate.getMonth() + expense.frequency_type_variable
          );
          currentDate.setDate(expense.frequency_day_of_month);
        } else {
          currentDate.setMonth(
            currentDate.getMonth() + expense.frequency_type_variable
          );
        }
        nextExpenseDate = currentDate;
        break;
      case 3: // Yearly
        if (
          expense.frequency_type_variable === 1 ||
          expense.frequency_type_variable === null
        )
          expenseFrequency = `Yearly on ${dayjs(
            expense.expense_begin_date
          ).format("MMMM D")}`;
        else
          expenseFrequency = `Every ${
            expense.frequency_type_variable
          } years on ${dayjs(expense.expense_begin_date).format("MMMM D")}`;

        if (expense.frequency_month_of_year) {
          currentDate.setFullYear(
            currentDate.getFullYear() + expense.frequency_type_variable
          );
          currentDate.setMonth(expense.frequency_month_of_year - 1); // Months are 0-indexed in JavaScript
        } else {
          currentDate.setFullYear(
            currentDate.getFullYear() + expense.frequency_type_variable
          );
        }
        nextExpenseDate = currentDate;
        break;
      default:
        expenseFrequency = "Unknown";
        nextExpenseDate = currentDate;
    }

    return {
      next_expense_date: nextExpenseDate,
      expense_frequency: expenseFrequency,
    };
  };

  return (
    <Box>
      <EnhancedTableToolbar
        numSelected={selected.length}
        selectedRows={selected}
        rowModes={rowModes}
        setRowModes={setRowModes}
        showAddExpenseForm={showAddExpenseForm}
        setShowAddExpenseForm={setShowAddExpenseForm}
        name="Expenses"
      />
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size={"medium"}
        >
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={!expenses ? 0 : expenses.length}
            headCells={headCells}
          />
          <TableBody>
            <Suspense fallback={<Loading />}>
              {visibleRows.map((row, index) => {
                if (rowModes[row.expense_id as number] === "delete") {
                  return <RowDelete expense={row} setRowModes={setRowModes} />;
                } else if (rowModes[row.expense_id as number] === "edit") {
                  return (
                    <RowEdit
                      expense={row}
                      taxes={taxes}
                      setRowModes={setRowModes}
                    />
                  );
                } else {
                  return (
                    <>
                      {showAddExpenseForm && (
                        <RowAdd
                          expense={row}
                          taxes={taxes}
                          setShowAddExpenseForm={setShowAddExpenseForm}
                        />
                      )}
                      <RowView
                        key={row.expense_id}
                        row={row}
                        index={index}
                        handleClick={handleClick}
                        isSelected={isSelected}
                        taxes={taxes}
                        getNextExpenseDateAndFrequency={
                          getNextExpenseDateAndFrequency
                        }
                      />
                    </>
                  );
                }
              })}
            </Suspense>
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 53 * emptyRows,
                }}
              >
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={expenses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default ExpensesTable;
