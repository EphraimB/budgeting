"use client";

import Stack from "@mui/material/Stack";
import ExpensesWidget from "./ExpensesWidget";
import LoansWidget from "./LoansWidget";
import { Expense, Loan, Tax } from "@/app/types/types";
import TransactionsWidget from "./TransactionsWidget";
import { usePathname, useParams } from "next/navigation";

function DataManagementWidgets({
  account_id,
  expenses,
  loans,
  taxes,
}: {
  account_id: number;
  expenses: Expense[];
  loans: Loan[];
  taxes: Tax[];
}) {
  const pathname = usePathname();
  const params = useParams();

  return (
    <Stack direction="row" spacing={2}>
      <TransactionsWidget
        account_id={account_id}
        border={pathname === `/${params.account_id}`}
      />
      <ExpensesWidget
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
        border={pathname === `/${params.account_id}/expenses`}
      />
      <LoansWidget
        account_id={account_id}
        loans={loans}
        border={pathname === `/${params.account_id}/loans`}
      />
    </Stack>
  );
}

export default DataManagementWidgets;
