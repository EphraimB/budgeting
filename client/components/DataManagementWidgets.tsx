import Stack from "@mui/material/Stack";
import ExpensesWidget from "./ExpensesWidget";
import LoansWidget from "./LoansWidget";

function DataManagementWidgets({ accountId }: { accountId: number }) {
  return (
    <Stack direction="row" spacing={2}>
      <ExpensesWidget account_id={accountId} />
      <LoansWidget account_id={accountId} />
    </Stack>
  );
}

export default DataManagementWidgets;
