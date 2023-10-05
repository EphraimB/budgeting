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
