import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function RowDelete({ expense }: { expense: any }) {
  console.log(expense);
  return (
    <TableRow
      key={expense.expense_id}
      sx={{
        backgroundColor: "red",
      }}
    >
      <TableCell colSpan={5} sx={{ color: "#fff" }}>
        Are you sure you want to delete this expense called{" "}
        {expense.expense_title}?
      </TableCell>
      <TableCell sx={{ color: "#fff" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={() => {
              console.log("delete expense");
            }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              console.log("cancel delete expense");
            }}
          >
            Cancel
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default RowDelete;
