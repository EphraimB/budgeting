import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Tax } from "@/app/types/types";
import TaxCards from "../../../../components/taxes/TaxCards";

async function getTaxes() {
  try {
    const res = await fetch("http://server:5001/api/taxes");

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch taxes");
  }
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
