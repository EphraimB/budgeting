import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

function AccountDelete({
  account,
  setAccountMode,
}: {
  account: any;
  setAccountMode: any;
}) {
  const handleDelete = () => {
    // TODO: Delete account
    const deleteAccount = async () => {
      try {
        // Post request to create a new account
        await fetch("http://localhost:3000/accounts", {
          method: "Delete",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("There was an error creating the account!", error);
      }
      setAccountMode(0);
    };

    deleteAccount(); // Call the async function
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
        onClick={() => setAccountMode(0)}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <Box>
        <Typography variant="h6">Delete {account.name}?</Typography>
        <Typography variant="body1">
          Are you sure you want to delete this account? This action cannot be
          undone.
        </Typography>
        <br />
        <Button variant="contained" color="error">
          Delete
        </Button>
        <Button variant="contained" onClick={handleDelete}>
          Cancel
        </Button>
      </Box>
    </>
  );
}

export default AccountDelete;
