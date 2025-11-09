
import { NextRequest } from "next/server";



export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({ message: "Workshops admin route" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}