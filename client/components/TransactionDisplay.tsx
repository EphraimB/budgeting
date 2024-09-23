"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { green, red } from "@mui/material/colors";
import TablePagination from "@mui/material/TablePagination";
import { GeneratedTransaction, Transaction } from "@/app/types/types";

export default function TransactionDisplay({
  generatedTransactions,
}: {
  generatedTransactions: GeneratedTransaction[];
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const flatTransactions = useMemo(() => {
    return generatedTransactions
      ? generatedTransactions.flatMap(
          (dt: GeneratedTransaction) => dt.transactions
        )
      : [];
  }, [generatedTransactions]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="Transactions table"
        >
          <TableHead>
            <TableRow
              key="transactions-table-header"
              sx={{
                backgroundColor: "#000",
              }}
            >
              <TableCell sx={{ color: "#fff" }}>Date</TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Title
              </TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Description
              </TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Amount
              </TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Tax rate
              </TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Total amount
              </TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Balance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flatTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction: Transaction) => (
                <TableRow
                  key={`${transaction.id}-${transaction.date}-${transaction.title}-${transaction.amount}-${transaction.balance}`}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor:
                      transaction.totalAmount >= 0 ? green[500] : red[500],
                  }}
                >
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    component="th"
                    scope="row"
                  >
                    {dayjs(transaction.date).format("dddd")}
                    <br />
                    {dayjs(transaction.date).format("MMMM D, YYYY")}
                    <br />
                    {dayjs(transaction.date).format("h:mm A")}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    align="right"
                  >
                    {transaction.title}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    align="right"
                  >
                    {transaction.description}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    align="right"
                  >
                    ${(Math.round(transaction.amount * 100) / 100).toFixed(2)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    align="right"
                  >
                    {transaction.taxRate * 100}%
                  </TableCell>
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    align="right"
                  >
                    $
                    {(Math.round(transaction.totalAmount * 100) / 100).toFixed(
                      2
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: transaction.totalAmount >= 0 ? "#000" : "#fff",
                    }}
                    align="right"
                  >
                    ${(Math.round(transaction.balance * 100) / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={flatTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}
