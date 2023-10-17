import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";

function ExpensesWidget({ account_id }: { account_id: number }) {
  return (
    <Link
      href={`/expenses/${account_id}`}
      as={`/expenses/${account_id}`}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <Card sx={{ p: 2, margin: "auto", maxWidth: 500, flexGrow: 1 }}>
        <CardHeader title="Expenses" />
        <CardContent sx={{ flexGrow: 1 }}></CardContent>
      </Card>
    </Link>
  );
}

export default ExpensesWidget;
