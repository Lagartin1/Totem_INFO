export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const 
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  return Response.json({ id: params.id, actualizado: body });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return Response.json({ id: params.id, eliminado: true }, { status: 204 });
}
