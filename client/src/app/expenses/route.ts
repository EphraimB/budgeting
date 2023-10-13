export async function GET(request: Request) {
  const res = await fetch("http://server:5001/api/expenses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return Response.json(res);
}
