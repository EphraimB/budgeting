"use client";

import { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Transfer } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import TransfersActionsMenu from "./TransfersActionsMenu";
import dayjs from "dayjs";

function TransfersView({
  account_id,
  transfer,
  setTransferModes,
}: {
  account_id: number;
  transfer: Transfer;
  setTransferModes: React.Dispatch<
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
      {transfer.destination_account_id === account_id && (
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
            aria-controls={open ? "transfer-action-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <MoreVert />
          </IconButton>
          <TransfersActionsMenu
            anchorEl={anchorEl}
            open={open}
            handleClose={handleClose}
            setTransferModes={setTransferModes}
            transfer_id={transfer.id}
          />
        </>
      )}
      <CardHeader
        title={transfer.transfer_title}
        subheader={transfer.transfer_description}
      />
      <CardContent>
        <Typography variant="body2">
          ${transfer.transfer_amount} will be transfered{" "}
          {transfer.source_account_id === account_id
            ? "from"
            : transfer.destination_account_id === account_id
            ? "to"
            : "n/a"}{" "}
          your account on{" "}
          {dayjs(transfer.next_date).format("dddd MMMM D, YYYY h:mm A")}.
        </Typography>
      </CardContent>
    </>
  );
}

export default TransfersView;
