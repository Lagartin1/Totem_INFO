export async function GET() {
  return Response.json([{ id: 1, nombre: "Estudiante X" }]);
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ creado: body }, { status: 201 });
}
