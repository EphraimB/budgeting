"use client";

import { Tax } from "@/app/types/types";
import Box from "@mui/material/Box";
import { deleteTax } from "../../services/actions/tax";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

function TaxDelete({
  tax,
  setTaxModes,
}: {
  tax: Tax;
  setTaxModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteTax(tax.id);

      // Show success message
      showSnackbar(`Tax "${tax.title}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting tax "${tax.title}"`, "error");
    }
    setTaxModes((prev) => ({ ...prev, [tax.id]: "view" }));
  };

  const handleCancel = () => {
    setTaxModes((prev) => ({ ...prev, [tax.id]: "view" }));
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
        Delete "{tax.title}"?
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

export default TaxDelete;
