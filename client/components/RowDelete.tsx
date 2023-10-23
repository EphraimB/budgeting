import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { red } from "@mui/material/colors";
import { useRouter } from "next/navigation";

function RowDelete({
  expense,
  setRowModes,
}: {
  expense: any;
  setRowModes: any;
}) {
  const router = useRouter();

  const handleDelete = () => {
    const deleteAccount = async () => {
      try {
        // Post request to create a new expense
        await fetch(
          `http://localhost:3000/api/expenses?expense_id=${expense.expense_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        router.refresh();
      } catch (error) {
        console.error("There was an error deleting the expense!", error);
        // showAlert("There was an error deleting the expense!", "error");
      }
      setRowModes((prevModes: any) => ({
        ...prevModes,
        [expense.expense_id]: "view",
      }));
      // showSnackbar("Expense deleted!");
    };

    deleteAccount();
  };

  const handleCancel = () => {
    setRowModes((prevModes: any) => ({
      ...prevModes,
      [expense.expense_id]: "view",
    }));
  };

  return (
    <TableRow
      key={expense.expense_id}
      sx={{
        backgroundColor: red[500],
      }}
    >
      <TableCell colSpan={5} sx={{ color: "#fff" }}>
        Are you sure you want to delete this expense called "
        {expense.expense_title}"?
      </TableCell>
      <TableCell sx={{ color: "#fff" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            onClick={handleDelete}
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
