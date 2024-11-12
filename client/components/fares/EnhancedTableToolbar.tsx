import { Toolbar, IconButton, Typography } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const EnhancedTableToolbar = ({ numSelected }: { numSelected: number }) => {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Fares
        </Typography>
      )}
      {numSelected > 0 && (
        <>
          <IconButton>
            <Edit />
          </IconButton>
          <IconButton>
            <Delete />
          </IconButton>
        </>
      )}
    </Toolbar>
  );
};

export default EnhancedTableToolbar;
