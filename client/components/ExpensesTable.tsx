"use client";

import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import { useAlert } from "../context/FeedbackContext";
import Skeleton from "@mui/material/Skeleton";
import EnhancedTableHead from "../components/EnhancedTableHead";
import EnhancedTableToolbar from "../components/EnhancedTableToolbar";
import dayjs from "dayjs";
import {
  getComparator,
  stableSort,
  type Order,
} from "../utils/helperFunctions";

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

function ExpensesTable({ accountId }: { accountId: number }) {
  const [expenses, setExpenses] = useState(null) as any[];
  const [loading, setLoading] = useState(true);
  const [taxes, setTaxes] = useState(null) as any[];
  const [taxesLoading, setTaxesLoading] = useState(true);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("expense_title");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/expenses?account_id=${accountId}`
        );
        if (!response.ok) {
          showAlert("Failed to load expenses", "error");
          return;
        }

        const data = await response.json();
        setExpenses(data.data);

        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        showAlert("Failed to load expenses", "error");
        setLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/taxes?account_id=${accountId}`
        );
        if (!response.ok) {
          showAlert("Failed to load taxes", "error");
          return;
        }

        const data = await response.json();
        setTaxes(data.data);

        setTaxesLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        showAlert("Failed to load taxes", "error");
        setTaxesLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchData();
  }, []);

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
      const newSelected = expenses.map((n: Expense) => n.expense_title);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
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

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - expenses.length) : 0;

  const visibleRows = useMemo(() => {
    if (loading || !expenses) {
      return [];
    }
    return stableSort(expenses, getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [loading, expenses, order, orderBy, page, rowsPerPage]);

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
          expenseFrequency = `Weekly on ${dayjs()
            .day(expense.expense_begin_date)
            .format("dddd")}`;
        else {
          expenseFrequency =
            "Every " +
            expense.frequency_type_variable +
            " weeks on " +
            dayjs().day(expense.expense_begin_date).format("dddd");
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
          } ${dayjs().day(expense.frequency_day_of_week).format("dddd")}`;
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
      <EnhancedTableToolbar numSelected={selected.length} name="Expenses" />
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
            {loading || !expenses ? (
              <Skeleton />
            ) : (
              visibleRows.map((row, index) => {
                const isItemSelected = isSelected(expenses.expense_title);
                const labelId = `enhanced-table-checkbox-${index}`;

                const taxObject = taxes
                  ? taxes.find((tax: any) => tax.tax_id === row.tax_id)
                  : 0;
                const taxRate = taxObject ? parseFloat(taxObject.tax_rate) : 0;
                const amountAfterTax: number =
                  parseFloat(row.expense_amount as string) * (1 + taxRate);

                const amountAfterSubsidy: number =
                  amountAfterTax -
                  amountAfterTax * parseFloat(row.expense_subsidized as string);

                return (
                  <TableRow
                    hover
                    onClick={(event) =>
                      handleClick(event, expenses.expense_title)
                    }
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={expenses.expense_title}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.expense_title}
                    </TableCell>
                    <TableCell align="right">
                      {row.expense_description}
                    </TableCell>
                    <TableCell align="right">
                      $
                      {(
                        Math.round((amountAfterSubsidy as number) * 100) / 100
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {dayjs(
                        getNextExpenseDateAndFrequency(row).next_expense_date
                      ).format("dddd")}
                      <br />
                      {dayjs(
                        getNextExpenseDateAndFrequency(row).next_expense_date
                      ).format("MMMM D, YYYY")}
                      <br />
                      {dayjs(
                        getNextExpenseDateAndFrequency(row).next_expense_date
                      ).format("h:mm A")}
                    </TableCell>
                    <TableCell align="right">
                      {getNextExpenseDateAndFrequency(row).expense_frequency}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
        count={loading || !expenses ? 0 : expenses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default ExpensesTable;
