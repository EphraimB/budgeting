import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

function AccountDelete({
  account,
  setAccountMode,
}: {
  account: any;
  setAccountMode: any;
}) {
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
    </>
  );
}

export default AccountDelete;
