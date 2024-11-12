"use client";

import { FareDetail, Timeslot } from "@/app/types/types";
import Grid from "@mui/material/Grid2";
import {
  Box,
  Checkbox,
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
import { useState } from "react";
import EnhancedTableToolbar from "./EnhancedTableToolbar";

function FareDetailsTable({ fareDetails }: { fareDetails: FareDetail[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [numSelected, setNumSelected] = useState<number>(0);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(
        fareDetails.map((fareDetail) => fareDetail.name)
      );
      setSelected(newSelected);
      setNumSelected(newSelected.size);
    } else {
      setSelected(new Set());
      setNumSelected(0);
    }
  };

  const handleClick = (
    _: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const newSelected = new Set(selected);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelected(newSelected);
    setNumSelected(newSelected.size);
  };

  return (
    <Paper>
      <EnhancedTableToolbar numSelected={numSelected} />
      <TableContainer>
        <Table
          sx={{ minWidth: { xs: "100%", sm: 650 } }}
          size="small"
          aria-label="Fares table"
        >
          <TableHead>
            <TableRow
              key="fares-table-header"
              sx={{
                backgroundColor: "#000",
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    numSelected > 0 && numSelected < fareDetails.length
                  }
                  checked={numSelected === fareDetails.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
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
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selected.has(fareDetail.name)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleClick(event, fareDetail.name)
                    }
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  {fareDetail.name}
                </TableCell>
                <TableCell align="right">${fareDetail.fare}</TableCell>
                <TableCell align="right">
                  <Grid container spacing={1}>
                    {fareDetail.timeslots.map(
                      (timeslot: Timeslot, index: number) => (
                        <Grid
                          key={index}
                          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        >
                          <Paper sx={{ padding: 1, textAlign: "center" }}>
                            <Typography component="h6" variant="body1">
                              {dayjs().day(timeslot.dayOfWeek).format("dddd")}
                            </Typography>
                            <Typography component="p" variant="body2">
                              {dayjs()
                                .hour(
                                  parseInt(timeslot.startTime.split(":")[0])
                                )
                                .minute(
                                  parseInt(timeslot.startTime.split(":")[1])
                                )
                                .format("hh:mm A")}
                              -
                              {dayjs()
                                .hour(parseInt(timeslot.endTime.split(":")[0]))
                                .minute(
                                  parseInt(timeslot.endTime.split(":")[1])
                                )
                                .format("hh:mm A")}
                            </Typography>
                          </Paper>
                        </Grid>
                      )
                    )}
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default FareDetailsTable;
