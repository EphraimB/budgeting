import { Card, CardContent, Stack, Typography } from "@mui/material";
import { CommuteOverview } from "@/app/types/types";
import Link from "next/link";

async function getCommuteOverview(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/expenses/commute?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch commute overview");
  }
}

async function Commute({ params }: { params: { accountId: string } }) {
  const accountId = parseInt(params.accountId);

  const commuteOverview: CommuteOverview[] = await getCommuteOverview(
    accountId
  );

  return (
    <>
      <Typography>
        Total cost per month is ${commuteOverview[0].totalCostPerMonth}
      </Typography>
      <br />
      <Stack
        spacing={2}
        direction="row"
        sx={{
          justifyContent: "center",
        }}
      >
        <Link
          href={`/${accountId}/commute/systems`}
          as={`/${accountId}/commute/systems`}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <Card elevation={1} sx={{ width: 175, overflow: "visible" }}>
            <CardContent>
              <Typography gutterBottom variant="h5">
                Commute Systems
              </Typography>
              <Typography>
                Click to view, add, or edit commute systems
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </Stack>
    </>
  );
}

export default Commute;
