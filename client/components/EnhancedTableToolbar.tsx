import Checkbox from "@mui/material/Checkbox";
import Toolbar from "@mui/material/Toolbar";
import { alpha } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import Typography from "@mui/material/Typography";

interface EnhancedTableToolbarProps {
  numSelected: number;
  name: string;
  rowModes: Record<number, string>;
  setRowModes: any;
  selectedRows: number[];
}

function EnhancedTableToolbar({
  numSelected,
  name,
  rowModes,
  setRowModes,
  selectedRows,
}: EnhancedTableToolbarProps) {
  const handleDeleteClick = () => {
    console.log(selectedRows);
    let updatedRowModes = { ...rowModes }; // Create a shallow copy of the current state
    for (const expenseId of selectedRows) {
      updatedRowModes[expenseId] = "delete";
    }
    setRowModes(updatedRowModes);
  };

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
          {name}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default EnhancedTableToolbar;
