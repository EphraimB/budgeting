"use client";

import { Loan } from "@/app/types/types";
import Box from "@mui/material/Box";
import { deleteLoan } from "../../services/actions/loan";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

function LoanDelete({
  loan,
  setLoanModes,
}: {
  loan: Loan;
  setLoanModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteLoan(loan.id);

      // Show success message
      showSnackbar(`Loan "${loan.title}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting loan "${loan.title}"`, "error");
    }
    setLoanModes((prev) => ({ ...prev, [loan.id]: "view" }));
  };

  const handleCancel = () => {
    setLoanModes((prev) => ({ ...prev, [loan.id]: "view" }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleCancel}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <br />
      <Typography variant="subtitle1" component="h3">
        Delete "{loan.title}"?
      </Typography>
      <Button color="error" variant="contained" onClick={handleDelete}>
        Delete
      </Button>
      <Button color="primary" variant="contained" onClick={handleCancel}>
        Cancel
      </Button>
    </Box>
  );
}

export default LoanDelete;
