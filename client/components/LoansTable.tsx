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
import { Loan, HeadCell } from "@/app/types/types";
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
import { addLoan, deleteLoan, editLoan } from "../services/actions/loan";

const headCells: readonly HeadCell[] = [
  {
    id: "loan_title",
    numeric: false,
    label: "Title",
  },
  {
    id: "loan_description",
    numeric: false,
    label: "Description",
  },
  {
    id: "loan_plan_amount",
    numeric: false,
    label: "Plan amount ($)",
  },
  {
    id: "loan_amount",
    numeric: false,
    label: "Amount ($)",
  },
  {
    id: "next_expense_date",
    numeric: false,
    label: "Next loan date",
  },
  {
    id: "loan_frequency",
    numeric: false,
    label: "Loan frequency",
  },
  {
    id: "fully_paid_back",
    numeric: false,
    label: "Fully paid back",
  },
];

function LoansTable({
  account_id,
  loans,
}: {
  account_id: number;
  loans: Loan[];
}) {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("loan_title");
  const [selected, setSelected] = useState<Loan[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rowModes, setRowModes] = useState<Record<number, string>>({});
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - loans.length) : 0;

  const visibleRows = useVisibleRows(loans, order, orderBy, page, rowsPerPage);

  const handleAdd = async (loan: Loan) => {
    try {
      await addLoan(loan);
    } catch (err) {
      console.error(err);
    }

    setShowAddExpenseForm(false);
  };

  const handleEdit = async (loan: Loan, id: number) => {
    try {
      await editLoan(loan, id);
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
      await deleteLoan(id);
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
        name="Loans"
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
              handleSelectAllClick(event, loans, setSelected)
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
            rowCount={!loans ? 0 : loans.length}
            headCells={headCells}
          />
          <TableBody>
            {showAddExpenseForm && (
              <RowAdd
                account_id={account_id}
                setShowAddForm={setShowAddExpenseForm}
                handleAdd={handleAdd}
                type={1}
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
                      setRowModes={setRowModes}
                      handleEdit={handleEdit}
                      type={1}
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
                      getExpenseFrequency={getFrequency}
                      type={1}
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
        count={loans.length}
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

export default LoansTable;
