import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const accountId = searchParams.get("account_id");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  if (!accountId || !fromDate || !toDate) {
    return Response.json({
      error: "Missing required query parameters",
    });
  }

  const res = await fetch(
    `http://server:5001/api/transactions?account_id=${accountId}&from_date=${fromDate.substring(
      0,
      10
    )}&to_date=${toDate.substring(0, 10)}`
  );

  const data = await res.json();

  return Response.json({ data });
}
