import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

function GlobalAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }} mb={2}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Budgeting
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default GlobalAppBar;
