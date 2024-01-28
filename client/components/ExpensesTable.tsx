"use client";

import { useState, Suspense } from "react";
import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import EnhancedTableHead from "../components/EnhancedTableHead";
import EnhancedTableToolbar from "../components/EnhancedTableToolbar";
import RowView from "./RowView";
import RowDelete from "./RowDelete";
import LoadingExpenses from "./LoadingExpenses";
import RowEdit from "./RowEdit";
import RowAdd from "./RowAdd";
import { Expense, HeadCell, Tax } from "@/app/types/types";
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
import {
  addExpense,
  deleteExpense,
  editExpense,
} from "../services/actions/expense";

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
  taxes: Tax[];
}) {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("expense_title");
  const [selected, setSelected] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rowModes, setRowModes] = useState<Record<number, string>>({});
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - expenses.length) : 0;

  const visibleRows = useVisibleRows(
    expenses,
    order,
    orderBy,
    page,
    rowsPerPage
  );

  const handleAdd = async (expense: any) => {
    try {
      await addExpense(expense);
    } catch (err) {
      console.error(err);
    }

    setShowAddExpenseForm(false);
  };

  const handleEdit = async (expense: any, id: number) => {
    try {
      await editExpense(expense, id);
    } catch (err) {
      console.error(err);
    }

    setRowModes((prevModes: any) => ({
      ...prevModes,
      [id]: "view",
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense(id);
    } catch (err) {
      console.error(err);
    }

    setRowModes((prevModes: any) => ({
      ...prevModes,
      [id]: "view",
    }));
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
                account_id={account_id}
                taxes={taxes}
                setShowAddForm={setShowAddExpenseForm}
                handleAdd={handleAdd}
                type={0}
              />
            )}
            <Suspense fallback={<LoadingExpenses />}>
              {visibleRows.map((row: any, index: number) => {
                if (rowModes[row.id as number] === "delete") {
                  return (
                    <RowDelete
                      row={row}
                      setRowModes={setRowModes}
                      handleDelete={handleDelete}
                    />
                  );
                } else if (rowModes[row.id as number] === "edit") {
                  return (
                    <RowEdit
                      account_id={account_id}
                      row={row}
                      taxes={taxes}
                      setRowModes={setRowModes}
                      handleEdit={handleEdit}
                      type={0}
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
                      type={0}
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
