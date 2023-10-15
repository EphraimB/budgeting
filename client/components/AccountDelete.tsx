import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useSnackbar } from "../context/FeedbackContext";
import { useAlert } from "../context/FeedbackContext";

function AccountDelete({
  account,
  setAccountModes,
}: {
  account: any;
  setAccountModes: any;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = () => {
    const deleteAccount = async () => {
      try {
        // Post request to create a new account
        await fetch(
          `http://localhost:3000/api/accounts?account_id=${account.account_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("There was an error deleting the account!", error);
        showAlert("There was an error deleting the account!", "error");
      }
      setAccountModes((prevModes: any) => ({
        ...prevModes,
        [account.account_id]: "view",
      }));
      showSnackbar("Account deleted!");
    };

    deleteAccount();
  };

  const handleCancel = () => {
    setAccountModes((prevModes: any) => ({
      ...prevModes,
      [account.account_id]: "view",
    }));
  };

  return (
    <>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={() =>
          setAccountModes((prevModes: any) => ({
            ...prevModes,
            [account.account_id]: "view",
          }))
        }
      >
        <CloseIcon />
      </IconButton>
      <br />
      <Box>
        <Typography variant="h6">Delete {account.account_name}?</Typography>
        <Typography variant="body1">
          Are you sure you want to delete this account? This action cannot be
          undone.
        </Typography>
        <br />
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="contained" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </>
  );
}

export default AccountDelete;
