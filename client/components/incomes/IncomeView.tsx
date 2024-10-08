"use client";

import { useState } from "react";
import dayjs from "dayjs";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Income } from "@/app/types/types";
import { getFrequency } from "../../utils/helperFunctions";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import IncomeActionsMenu from "./IncomeActionsMenu";

function IncomeView({
  income,
  setIncomeModes,
}: {
  income: Income;
  setIncomeModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
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
      <IncomeActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setIncomeModes={setIncomeModes}
        incomeId={income.id}
      />
      <CardHeader title={income.title} subheader={income.description} />
      <CardContent>
        <Typography variant="body2">
          You will be charged ${income.amount.toFixed(2)} next on{" "}
          {dayjs(income.nextDate).format("dddd MMMM D, YYYY h:mm A")}. You get
          charged {getFrequency(income)}.
        </Typography>
      </CardContent>
    </>
  );
}

export default IncomeView;
