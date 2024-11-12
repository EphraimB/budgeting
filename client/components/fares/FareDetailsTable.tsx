import { FareDetail, Timeslot } from "@/app/types/types";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

function FareDetailsTable({ fareDetails }: { fareDetails: FareDetail[] }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="Fares table">
        <TableHead>
          <TableRow
            key="fares-table-header"
            sx={{
              backgroundColor: "#000",
            }}
          >
            <TableCell sx={{ color: "#fff" }}>Type</TableCell>
            <TableCell sx={{ color: "#fff" }} align="right">
              Fare
            </TableCell>
            <TableCell sx={{ color: "#fff" }} align="right">
              Times valid
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fareDetails.map((fareDetail: FareDetail) => (
            <TableRow
              key={fareDetail.name}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                {fareDetail.name}
              </TableCell>
              <TableCell align="right">${fareDetail.fare}</TableCell>
              <TableCell align="right">
                {fareDetail.timeslots.map(
                  (timeslot: Timeslot, index: number) => (
                    <Paper key={index}>
                      <Typography component="h6" variant="body1">
                        {dayjs().day(timeslot.dayOfWeek).format("dddd")}
                      </Typography>
                      <Typography component="p" variant="body2">
                        {dayjs()
                          .hour(parseInt(timeslot.startTime.split(":")[0]))
                          .minute(parseInt(timeslot.startTime.split(":")[1]))
                          .format("hh:mm A")}
                        -
                        {dayjs()
                          .hour(parseInt(timeslot.endTime.split(":")[0]))
                          .minute(parseInt(timeslot.endTime.split(":")[1]))
                          .format("hh:mm A")}
                      </Typography>
                    </Paper>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default FareDetailsTable;
