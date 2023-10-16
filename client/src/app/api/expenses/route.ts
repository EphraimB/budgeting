import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const accountId = searchParams.get("account_id");

  const res = await fetch(
    `http://server:5001/api/expenses?account_id=${accountId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  return Response.json({ data });
}
