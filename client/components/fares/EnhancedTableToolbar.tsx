import { Toolbar, IconButton, Typography } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { FareDetail } from "@/app/types/types";

const EnhancedTableToolbar = ({
  selectedFareDetail,
  setFareDetailModes,
}: {
  selectedFareDetail: FareDetail | null;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) => {
  const handleEdit = () => {};

  const handleDelete = () => {
    if (selectedFareDetail) {
      setFareDetailModes((prevModes: any) => ({
        ...prevModes,
        [selectedFareDetail.id]: "delete",
      }));
    }
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selectedFareDetail !== null && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {selectedFareDetail !== null ? (
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
      {selectedFareDetail !== null && (
        <>
          <IconButton>
            <Edit />
          </IconButton>
          <IconButton onClick={handleDelete}>
            <Delete />
          </IconButton>
        </>
      )}
    </Toolbar>
  );
};

export default EnhancedTableToolbar;
