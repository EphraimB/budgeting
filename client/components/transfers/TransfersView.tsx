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
  accountId,
  transfer,
  setTransferModes,
}: {
  accountId: number;
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
      {transfer.sourceAccountId === accountId && (
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
            transferId={transfer.id}
          />
        </>
      )}
      <CardHeader title={transfer.title} subheader={transfer.description} />
      <CardContent>
        <Typography variant="body2">
          ${transfer.amount.toFixed(2)} will be transfered{" "}
          {transfer.sourceAccountId === accountId
            ? "from"
            : transfer.destinationAccountId === accountId
            ? "to"
            : "n/a"}{" "}
          your account on{" "}
          {dayjs(transfer.nextDate).format("dddd MMMM D, YYYY h:mm A")}
          {transfer.dates.endDate !== null
            ? ` until ${dayjs(transfer.dates.endDate).format(
                "dddd MMMM D, YYYY h:mm A"
              )}`
            : null}
          .
        </Typography>
      </CardContent>
    </>
  );
}

export default TransfersView;
