import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  const res = await fetch("http://server:5001/api/accounts");

  const data = await res.json();

  return Response.json({ data });
}

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("accounts");
  const data = await request.json();

  const res = await fetch("http://server:5001/api/accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  revalidateTag(tag as string);

  return Response.json(res);
}

export async function PUT(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  const { searchParams } = new URL(request.url);
  const account_id = searchParams.get("account_id");

  if (!account_id) {
    return Response.json({
      error: "Missing required query parameters",
    });
  }

  const data = await request.json();

  const res = await fetch(`http://server:5001/api/accounts/${account_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  revalidateTag(tag as string);

  return Response.json(res);
}

export async function DELETE(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  const { searchParams } = new URL(request.url);
  const account_id = searchParams.get("account_id");

  if (!account_id) {
    return Response.json({
      error: "Missing required query parameters",
    });
  }

  const res = await fetch(`http://server:5001/api/accounts/${account_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  revalidateTag(tag as string);

  return Response.json(res);
}
