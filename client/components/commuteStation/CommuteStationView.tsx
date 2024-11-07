"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CommuteStation } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";

function CommuteStationView({
  commuteStation,
  setCommuteStationModes,
}: {
  commuteStation: CommuteStation;
  setCommuteStationModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        onClick={handleClick}
        aria-controls={open ? "commute-station-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <CommuteStationActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setCommuteStationModes={setCommuteStationModes}
        commuteStationId={commuteStation.id}
      />
      <CardHeader title={commuteStation.fromStation} />
      <CardContent>
        <Typography variant="body2"></Typography>
      </CardContent>
    </>
  );
}

export default CommuteStationView;
