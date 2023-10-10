import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

function ExpensesWidget({ selectedAccountId }: { selectedAccountId: number }) {
  return (
    <Card sx={{ p: 2, margin: "auto", maxWidth: 500, flexGrow: 1 }}>
      <CardHeader title="Expenses" />
      <CardContent sx={{ flexGrow: 1 }}></CardContent>
    </Card>
  );
}

export default ExpensesWidget;
