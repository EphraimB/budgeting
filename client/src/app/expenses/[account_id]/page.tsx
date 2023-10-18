"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import ExpensesTable from "../../../../components/ExpensesTable";

function Expenses({ params }: { params: { account_id: string } }) {
  const accountId = parseInt(params.account_id);

  const [expenses, setExpenses] = useState(null) as any[];
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Link
        href={`/ transactions/${accountId}`}
        as={`/transactions/${accountId}`}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        <Card
          sx={{
            p: 2,
            margin: "auto",
            maxWidth: 250,
            flexGrow: 1,
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
      <ExpensesTable
        accountId={accountId}
        expenses={expenses}
        setExpenses={setExpenses}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
}

export default Expenses;
