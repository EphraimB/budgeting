import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { red } from "@mui/material/colors";
import React from "react";

function RowDelete({
  row,
  setRowModes,
  handleDelete,
}: {
  row: any;
  setRowModes: React.Dispatch<React.SetStateAction<any>>;
  handleDelete: any;
}) {
  const handleCancel = () => {
    setRowModes((prevModes: any) => ({
      ...prevModes,
      [row.id]: "view",
    }));
  };

  return (
    <TableRow
      key={row.id}
      sx={{
        backgroundColor: red[500],
      }}
    >
      <TableCell colSpan={5} sx={{ color: "#fff" }}>
        Are you sure you want to delete this expense called "{row.title}"?
      </TableCell>
      <TableCell sx={{ color: "#fff" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
          <Button variant="contained" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default RowDelete;
