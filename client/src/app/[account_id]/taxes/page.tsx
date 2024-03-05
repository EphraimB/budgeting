import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Tax } from "@/app/types/types";
import TaxCards from "../../../../components/TaxCards";

async function getTaxes() {
  const res = await fetch("http://server:5001/api/taxes");

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function Taxes() {
  const taxes: Tax[] = await getTaxes();

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Taxes
      </Typography>
      <br />
      <Typography>
        You have {taxes.length} tax{taxes.length === 1 ? "" : "es"}
      </Typography>
      <br />
      <TaxCards taxes={taxes} />
    </Stack>
  );
}

export default Taxes;
