"use client";

import { useState, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { useAlert } from "../context/FeedbackContext";
import { green, red } from "@mui/material/colors";
import TablePagination from "@mui/material/TablePagination";

export default function TransactionDisplay({
  accountId,
  from_date,
  to_date,
}: {
  accountId: number;
  from_date: Dayjs;
  to_date: Dayjs;
}) {
  const [transactions, setTransactions] = useState(null) as any[];
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/transactions?account_id=${accountId}&from_date=${from_date.format()}&to_date=${to_date.format()}`
        );
        if (!response.ok) {
          showAlert("Failed to load transactions", "error");
          return;
        }

        const data = await response.json();
        setTransactions(data.data);

        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        showAlert("Failed to load transactions", "error");
        setLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchData();
  }, [from_date, to_date]);

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
    return transactions
      ? transactions.flatMap((dt: any) => dt.transactions)
      : [];
  }, [transactions]);

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
          {loading || !transactions ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {flatTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction: any) => (
                  <TableRow
                    key={`${transaction.id}-${transaction.date}-${transaction.title}-${transaction.amount}-${transaction.balance}`}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor:
                        transaction.total_amount >= 0 ? green[500] : red[500],
                    }}
                  >
                    <TableCell
                      sx={{
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
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
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
                      }}
                      align="right"
                    >
                      {transaction.title}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
                      }}
                      align="right"
                    >
                      {transaction.description}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
                      }}
                      align="right"
                    >
                      ${(Math.round(transaction.amount * 100) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
                      }}
                      align="right"
                    >
                      {transaction.tax_rate * 100}%
                    </TableCell>
                    <TableCell
                      sx={{
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
                      }}
                      align="right"
                    >
                      $
                      {(
                        Math.round(transaction.total_amount * 100) / 100
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: transaction.total_amount >= 0 ? "#000" : "#fff",
                      }}
                      align="right"
                    >
                      $
                      {(Math.round(transaction.balance * 100) / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          )}
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
