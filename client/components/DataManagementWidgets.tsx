import Stack from "@mui/material/Stack";
import ExpensesWidget from "./ExpensesWidget";
import LoansWidget from "./LoansWidget";
import { Expense, Loan, Taxes } from "@/app/types/types";

function DataManagementWidgets({
  account_id,
  expenses,
  loans,
  taxes,
}: {
  account_id: number;
  expenses: Expense[];
  loans: Loan[];
  taxes: Taxes[];
}) {
  return (
    <Stack direction="row" spacing={2}>
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
