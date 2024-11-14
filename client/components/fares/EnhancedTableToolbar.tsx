import { Toolbar, IconButton, Typography } from "@mui/material";
import { Close, Delete, Edit } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const EnhancedTableToolbar = ({
  selectedId,
  setSelectedId,
  fareDetailModes,
  setFareDetailModes,
}: {
  selectedId: number | null;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
  fareDetailModes: Record<number, string>;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) => {
  const handleEdit = () => {
    if (selectedId) {
      setFareDetailModes((prevModes: any) => ({
        ...prevModes,
        [selectedId]: "edit",
      }));
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      setFareDetailModes((prevModes: any) => ({
        ...prevModes,
        [selectedId]: "delete",
      }));
    }
  };

  const handleClose = () => {
    if (selectedId) {
      setSelectedId(null);
      setFareDetailModes({});
    }
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selectedId !== null && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {selectedId !== null ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          1 selected
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
      {selectedId !== null &&
        (fareDetailModes[selectedId] === "edit" ||
        fareDetailModes[selectedId] === "delete" ? (
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        ) : (
          <>
            <IconButton onClick={handleEdit}>
              <Edit />
            </IconButton>
            <IconButton onClick={handleDelete}>
              <Delete />
            </IconButton>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </>
        ))}
    </Toolbar>
  );
};

export default EnhancedTableToolbar;
