import Stack from "@mui/material/Stack";
import ExpensesWidget from "./ExpensesWidget";
import LoansWidget from "./LoansWidget";
import { Expense, Loan, Tax } from "@/app/types/types";
import TransactionsWidget from "./TransactionsWidget";

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
  return (
    <Stack direction="row" spacing={2}>
      <TransactionsWidget account_id={account_id} />
      <ExpensesWidget
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
      />
      <LoansWidget account_id={account_id} loans={loans} />
    </Stack>
  );
}

export default DataManagementWidgets;
