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

export async function POST(request: Request) {
  const data = await request.json();

  const res = await fetch("http://server:5001/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return Response.json(res);
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const expense_id = searchParams.get("expense_id");

  if (!expense_id) {
    return Response.json({
      error: "Missing required query parameters",
    });
  }

  const data = await request.json();

  const res = await fetch(`http://server:5001/api/expenses/${expense_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return Response.json(res);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const expense_id = searchParams.get("expense_id");

  if (!expense_id) {
    return Response.json({
      error: "Missing required query parameters",
    });
  }

  const res = await fetch(`http://server:5001/api/expenses/${expense_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return Response.json(res);
}
