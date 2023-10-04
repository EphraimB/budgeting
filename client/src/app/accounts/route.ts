export async function GET(request: Request) {
  const res = await fetch("http://server:5001/api/accounts");

  const data = await res.json();

  return Response.json({ data });
}
