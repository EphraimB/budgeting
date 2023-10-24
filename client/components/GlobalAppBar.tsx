import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Image from "next/image";

function GlobalAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Image src="/img/logo.png" alt="logo" width={50} height={50} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Budgeting
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default GlobalAppBar;
