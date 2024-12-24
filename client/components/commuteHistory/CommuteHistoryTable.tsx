import { CommuteHistory } from "@/app/types/types";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";

export default function CommuteHistoryTable({
  commuteHistory,
}: {
  commuteHistory: CommuteHistory[];
}) {
  return (
    <TableContainer component={Paper} aria-label="commute history table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Commute system</TableCell>
            <TableCell>Fare type</TableCell>
            <TableCell>Fare</TableCell>
            <TableCell>Purchased</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {commuteHistory.map((ch) => (
            <TableRow
              key={ch.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {ch.commuteSystem}
              </TableCell>
              <TableCell align="right">{ch.fareType}</TableCell>
              <TableCell align="right">${ch.fare.toFixed(2)}</TableCell>
              <TableCell align="right">
                {dayjs(ch.timestamp).format("dddd")}
                <br />
                {dayjs(ch.timestamp).format("MMMM D, YYYY")}
                <br />
                {dayjs(ch.timestamp).format("h:mm A")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
