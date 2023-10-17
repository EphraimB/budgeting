import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";

function ExpensesWidget({ account_id }: { account_id: number }) {
  return (
    <Link
      href={`/expenses/${account_id}`}
      as={`/expenses/${account_id}`}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <Card
        sx={{
          p: 2,
          margin: "auto",
          maxWidth: 250,
          flexGrow: 1,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/expenses.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <CardHeader title="Expenses" />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="white">
            View and manage your expenses.
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ExpensesWidget;
