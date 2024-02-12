import React from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

function TransactionsWidget({ account_id }: { account_id: number }) {
  return (
    <Link
      href={`/${account_id}`}
      as={`/${account_id}`}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <Card
        sx={{
          p: 2,
          margin: "auto",
          width: 250,
          height: 200,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/back-to-transactions.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <CardHeader title="< Transactions" />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="white">
            Go back to transactions.
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

export default TransactionsWidget;