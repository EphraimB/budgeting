"use client";

import { PayrollTax } from "@/app/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { deletePayrollTax } from "../../services/actions/payrollTax";

function PayrollTaxDelete({
  payrollTax,
  setPayrollTaxModes,
}: {
  payrollTax: PayrollTax;
  setPayrollTaxModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deletePayrollTax(payrollTax.id);

      // Show success message
      showSnackbar(`Payroll Tax "${payrollTax.name}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting payroll tax "${payrollTax.name}"`, "error");
    }
    setPayrollTaxModes((prev) => ({ ...prev, [payrollTax.id]: "view" }));
  };

  const handleCancel = () => {
    setPayrollTaxModes((prev) => ({ ...prev, [payrollTax.id]: "view" }));
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
        Delete &quot;{payrollTax.name}&quot;?
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

export default PayrollTaxDelete;
