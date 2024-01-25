import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";

function LoansWidget({ account_id }: { account_id: number }) {
  return (
    <Link
      href={`/${account_id}/loans`}
      as={`/${account_id}/loans`}
      style={{ color: "inherit", textDecoration: "inherit" }}
    >
      <Card
        sx={{
          p: 2,
          margin: "auto",
          maxWidth: 250,
          flexGrow: 1,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/loans.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <CardHeader title="Loans" />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="white">
            View and manage your loans.
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}

export default LoansWidget;
