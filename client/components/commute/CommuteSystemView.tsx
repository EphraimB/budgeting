"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CommuteSystem } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import CommuteSystemActionsMenu from "./CommuteSystemActionsMenu";
import Link from "next/link";

function CommuteSystemView({
  accountId,
  commuteSystem,
  setCommuteSystemModes,
}: {
  accountId: number;
  commuteSystem: CommuteSystem;
  setCommuteSystemModes: React.Dispatch<
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
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <CommuteSystemActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setCommuteSystemModes={setCommuteSystemModes}
        commuteSystemId={commuteSystem.id}
      />
      <CardHeader title={commuteSystem.name} />
      <Link
        href={`/${accountId}/commute/${commuteSystem.id}`}
        as={`/${accountId}/commute/${commuteSystem.id}`}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <CardContent>
          <Typography variant="body2">
            There's{" "}
            {commuteSystem.fareCap
              ? `a fare cap of $${commuteSystem.fareCap} per ${
                  commuteSystem.fareCapDuration === 0
                    ? "day"
                    : commuteSystem.fareCapDuration === 1
                    ? "week"
                    : commuteSystem.fareCapDuration === 2
                    ? "month"
                    : commuteSystem.fareCapDuration === 3
                    ? "year"
                    : ""
                }`
              : "no fare cap"}{" "}
            for this system
          </Typography>
        </CardContent>
      </Link>
    </>
  );
}

export default CommuteSystemView;
