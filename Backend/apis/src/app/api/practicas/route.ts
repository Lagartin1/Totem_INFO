export async function GET() {
  const data = [{ id: 1, titulo: "Practica A" }];
  return Response.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  // guardar body...
  return Response.json({ creado: body }, { status: 201 });
}
