import * as React from "react";
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
}: {
  accountId: number | null;
}) {
  const dateToday: string = new Date().toISOString().slice(0, 10);
  const endDate: string = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  )
    .toISOString()
    .slice(0, 10);

  const { data, error, isLoading } = useSWR<any>(
    `http://localhost:5001/api/transactions?account_id=${accountId}&from_date=${dateToday}&to_date=${endDate}`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (isLoading) return <CircularProgress />;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">amount</TableCell>
            <TableCell align="right">tax_rate</TableCell>
            <TableCell align="right">total_amount</TableCell>
            <TableCell align="right">balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((transaction: any) => (
            <TableRow
              //   key={transaction.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {transaction.title}
              </TableCell>
              <TableCell align="right">{transaction.description}</TableCell>
              <TableCell align="right">{transaction.amount}</TableCell>
              <TableCell align="right">{transaction.tax_rate}</TableCell>
              <TableCell align="right">{transaction.total_amount}</TableCell>
              <TableCell align="right">{transaction.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
