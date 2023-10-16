import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpensesWidget from "./ExpensesWidget";

function DataManagementWidgets({
  selectedAccountId,
}: {
  selectedAccountId: number;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <ExpensesWidget selectedAccountId={selectedAccountId} />
      </Stack>
    </Box>
  );
}

export default DataManagementWidgets;
