import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import useSWR, { Fetcher } from "swr";

const fetcher: Fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TransactionDisplay({
  accountId,
  fromDate,
  toDate,
}: {
  accountId: number;
  fromDate: Dayjs;
  toDate: Dayjs;
}) {
  const { data, error, isLoading } = useSWR<any>(
    `http://localhost:5001/api/transactions?account_id=${accountId}&from_date=${fromDate
      .format()
      .substring(0, 10)}&to_date=${toDate.format().substring(0, 10)}`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (isLoading) return <CircularProgress />;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="right">Title</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Tax rate</TableCell>
            <TableCell align="right">Total amount</TableCell>
            <TableCell align="right">Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((dt: any) =>
            dt.transactions.map((transaction: any) => (
              <TableRow
                key={`${transaction.id}-${transaction.date}-${transaction.title}-${transaction.amount}-${transaction.balance}`}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {dayjs(transaction.date).format("dddd")}
                  <br />
                  {dayjs(transaction.date).format("MMMM D, YYYY")}
                  <br />
                  {dayjs(transaction.date).format("h:mm A")}
                </TableCell>
                <TableCell align="right">{transaction.title}</TableCell>
                <TableCell align="right">{transaction.description}</TableCell>
                <TableCell align="right">${transaction.amount}</TableCell>
                <TableCell align="right">
                  {transaction.tax_rate * 100}%
                </TableCell>
                <TableCell align="right">${transaction.total_amount}</TableCell>
                <TableCell align="right">${transaction.balance}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
