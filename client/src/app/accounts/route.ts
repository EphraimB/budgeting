export async function GET(request: Request) {
  const res = await fetch("http://server:5001/api/accounts");

  const data = await res.json();

  return Response.json({ data });
}

export async function POST(request: Request) {
  const data = await request.json();

  const res = await fetch("http://server:5001/api/accounts", {
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

  return Response.json(res);
}

export async function DELETE(request: Request) {
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

  return Response.json(res);
}
