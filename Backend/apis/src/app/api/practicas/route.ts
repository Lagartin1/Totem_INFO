export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const {searchParams} = new URL(_req.url);
  const pagina = searchParams.get('pagina') || '1';
  const indice = Number(pagina) > 1 ? (Number(pagina) - 1)*10: 0;
  console.log(indice);
  return Response.json({Pagina: pagina, Indice: indice});
}

export async function POST(req: Request) {
  const body = await req.json();
  // guardar body...
  return Response.json({ creado: body }, { status: 201 });
}
