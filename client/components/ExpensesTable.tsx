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
import RowView from "./RowView";
import RowDelete from "./RowDelete";
import LoadingExpenses from "./LoadingExpenses";
import RowEdit from "./RowEdit";
import RowAdd from "./RowAdd";
import { addExpense } from "../services/actions/expense";
import { Expense, HeadCell } from "@/app/types/types";
import {
  Order,
  getFrequency,
  handleChangePage,
  handleChangeRowsPerPage,
  handleClick,
  handleRequestSort,
  handleSelectAllClick,
  isSelected,
  useVisibleRows,
} from "../utils/helperFunctions";

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
  account_id,
  expenses,
  taxes,
}: {
  account_id: number;
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

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("0");
  const [expenseSubsidized, setExpenseSubsidized] = useState("0");
  const [expenseTax, setExpenseTax] = useState(0);
  const [expenseBeginDate, setExpenseBeginDate] = useState(dayjs().format());
  const [expenseEndDate, setExpenseEndDate] = useState<null | string>(null);
  const [expenseEndDateEnabled, setExpenseEndDateEnabled] = useState(false);
  const [expenseFrequency, setExpenseFrequency] = useState(2);
  const [frequencyVariable, setFrequencyVariable] = useState(1);
  const [frequencyDayOfWeek, setFrequencyDayOfWeek] = useState(-1);
  const [frequencyWeekOfMonth, setFrequencyWeekOfMonth] = useState(-1);
  const [frequencyMonthOfYear, setFrequencyMonthOfYear] = useState(-1);

  const handleExpenseEndDateEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExpenseEndDateEnabled(e.target.checked);

    if (e.target.checked) {
      setExpenseEndDate(dayjs().format());
    } else {
      setExpenseEndDate(null);
    }
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - expenses.length) : 0;

  const visibleRows = useVisibleRows(
    expenses,
    order,
    orderBy,
    page,
    rowsPerPage
  );

  return (
    <Box>
      <form id="row-data" action={addExpense}>
        <input type="hidden" name="account_id" value={account_id} />
      </form>

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
            onSelectAllClick={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleSelectAllClick(event, expenses, setSelected)
            }
            onRequestSort={(
              event: React.MouseEvent<unknown>,
              property: string
            ) =>
              handleRequestSort(
                event,
                property,
                order,
                orderBy,
                setOrder,
                setOrderBy
              )
            }
            rowCount={!expenses ? 0 : expenses.length}
            headCells={headCells}
          />
          <TableBody>
            {showAddExpenseForm && (
              <RowAdd
                taxes={taxes}
                setShowAddExpenseForm={setShowAddExpenseForm}
                handleExpenseEndDateEnabledChange={
                  handleExpenseEndDateEnabledChange
                }
                expenseTitle={expenseTitle}
                setExpenseTitle={setExpenseTitle}
                expenseDescription={expenseDescription}
                setExpenseDescription={setExpenseDescription}
                expenseAmount={expenseAmount}
                setExpenseAmount={setExpenseAmount}
                expenseSubsidized={expenseSubsidized}
                setExpenseSubsidized={setExpenseSubsidized}
                expenseTax={expenseTax}
                setExpenseTax={setExpenseTax}
                expenseBeginDate={expenseBeginDate}
                setExpenseBeginDate={setExpenseBeginDate}
                expenseEndDate={expenseEndDate}
                setExpenseEndDate={setExpenseEndDate}
                expenseEndDateEnabled={expenseEndDateEnabled}
                setExpenseEndDateEnabled={setExpenseEndDateEnabled}
                expenseFrequency={expenseFrequency}
                setExpenseFrequency={setExpenseFrequency}
                frequencyVariable={frequencyVariable}
                setFrequencyVariable={setFrequencyVariable}
                frequencyDayOfWeek={frequencyDayOfWeek}
                setFrequencyDayOfWeek={setFrequencyDayOfWeek}
                frequencyWeekOfMonth={frequencyWeekOfMonth}
                setFrequencyWeekOfMonth={setFrequencyWeekOfMonth}
                frequencyMonthOfYear={frequencyMonthOfYear}
                setFrequencyMonthOfYear={setFrequencyMonthOfYear}
              />
            )}
            <Suspense fallback={<LoadingExpenses />}>
              {visibleRows.map((row: any, index: number) => {
                if (rowModes[row.id as number] === "delete") {
                  return <RowDelete row={row} setRowModes={setRowModes} />;
                } else if (rowModes[row.id as number] === "edit") {
                  return (
                    <RowEdit
                      account_id={account_id}
                      row={row}
                      taxes={taxes}
                      setRowModes={setRowModes}
                    />
                  );
                } else {
                  return (
                    <RowView
                      key={row.id}
                      row={row}
                      index={index}
                      handleClick={(
                        event: React.MouseEvent<unknown>,
                        row: any
                      ) => handleClick(event, row, selected, setSelected)}
                      isSelected={(id: number) => isSelected(id, selected)}
                      taxes={taxes}
                      getExpenseFrequency={getFrequency}
                    />
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
        onPageChange={(
          event: React.MouseEvent<HTMLButtonElement> | null,
          newPage: number
        ) => handleChangePage(event, newPage, setPage)}
        onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          handleChangeRowsPerPage(event, setRowsPerPage, setPage)
        }
      />
    </Box>
  );
}

export default ExpensesTable;
