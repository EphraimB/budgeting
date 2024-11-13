import { FareDetail } from "@/app/types/types";
import { Button, TableCell, Typography } from "@mui/material";
import { deleteFareDetail } from "../../services/actions/fareDetail";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

const FareDeleteForm = ({
  fareDetail,
  setFareDetailModes,
}: {
  fareDetail: FareDetail;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) => {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteFareDetail(fareDetail.id);

      // Show success message
      showSnackbar(`Fare detail "${fareDetail.name}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting fare detail "${fareDetail.name}"`, "error");
    }

    setFareDetailModes((prevModes: any) => ({
      ...prevModes,
      [fareDetail.id]: "view",
    }));
  };

  const handleCancel = () => {
    setFareDetailModes((prevModes: any) => ({
      ...prevModes,
      [fareDetail.id]: "view",
    }));
  };

  return (
    <>
      <TableCell scope="row">
        <Typography>
          Are you sure you want to delete "{fareDetail.name}"?
        </Typography>
      </TableCell>
      <TableCell></TableCell>
      <TableCell align="right">
        <Button variant="contained" color="secondary" onClick={handleCancel}>
          No
        </Button>
        <Button variant="contained" color="primary" onClick={handleDelete}>
          Yes
        </Button>
      </TableCell>
    </>
  );
};

export default FareDeleteForm;
