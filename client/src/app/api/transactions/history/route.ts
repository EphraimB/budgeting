export async function POST(request: Request) {
  const data = await request.json();

  const res = await fetch("http://server:5001/api/transactions/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return Response.json(res);
}
