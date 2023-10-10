import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpensesWidget from "./ExpensesWidget";
import AccountSlip from "./AccountSlip";

function DataManagementWidgets({
  selectedAccountId,
}: {
  selectedAccountId: number;
}) {
  return (
    <Box>
      <AccountSlip selectedAccountId={selectedAccountId} />
      <br />
      <Stack direction="row" spacing={2}>
        <ExpensesWidget selectedAccountId={selectedAccountId} />
      </Stack>
    </Box>
  );
}

export default DataManagementWidgets;
