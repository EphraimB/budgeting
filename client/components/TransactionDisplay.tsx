import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import { useAlert } from "../context/FeedbackContext";
import { green, red } from "@mui/material/colors";

export default function TransactionDisplay({
  accountId,
  fromDate,
  toDate,
}: {
  accountId: number;
  fromDate: Dayjs;
  toDate: Dayjs;
}) {
  const [transactions, setTransactions] = useState(null) as any[];
  const [loading, setLoading] = useState(true);

  const { showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/transactions?account_id=${accountId}&from_date=${fromDate.format()}&to_date=${toDate.format()}`
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
  }, [accountId, fromDate, toDate, showAlert]);

  if (loading) return <CircularProgress />; // Show loader while loading is true
  if (!transactions) return null;

  return (
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
        <TableBody>
          {transactions.map((dt: any) =>
            dt.transactions.map((transaction: any) => (
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
                  {(Math.round(transaction.total_amount * 100) / 100).toFixed(
                    2
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    color: transaction.total_amount >= 0 ? "#000" : "#fff",
                  }}
                  align="right"
                >
                  ${(Math.round(transaction.balance * 100) / 100).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
