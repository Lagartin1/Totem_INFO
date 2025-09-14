import {es} from "../../../../database/elastic.ts";

const client = es(); // seteo cliente general

export async function GET(_req: Request, { params }: { params: { id: string; type: string }}) {
  const { type } = await params;
  let tipo_practica:any;
  if (type === "profesional") {
    tipo_practica = "Profesional";
  } else if (type === "inicial") {
    tipo_practica = "Inicial";
  }else {
    return Response.json({ error: "Tipo no soportado" }, { status: 400 });
  }



  // Funcion extrae los parametros de la URL (numero de pagina ) y realiza la consulta a elasticsearch devolviendo
  // 10 resultados por pagina, ademas de comenzar con un indice adecuado para cada pagina

  const {searchParams} = new URL(_req.url);
  const pagina = searchParams.get('pagina') || '1';
  const año = searchParams.get('year') || false;
  const indice = Number(pagina) > 1 ? (Number(pagina) - 1)*10: 0;
  console.log(indice);

  let response: any;
  if (año){
    response = await client.search({
      index: 'practicas',   // desde que index o "tabla" se extraen los datos
      from: indice,
      size: 10,
      body: {
        query: {
          bool :{
            must :[
              {
                term :{
                  tipo_practica : `${tipo_practica}`
                }
              },
              {
                range:{
                  created_at :{
                    gte: `${año}-01-01`,
                    lte: `${año}-12-31`
                  }
                }
              }
            ]
          },
        },
        _source: true // utilizando este parametro la query entrega los datos completos
      }
    });
  }
  else{
      response = await client.search({
      index: 'practicas',   // desde que index o "tabla" se extraen los datos
      from: indice,
      size: 10,
      body: {
        query: {
          match :{
            tipo_practica : `${tipo_practica}`
          }
        },
        _source: true // utilizando este parametro la query entrega los datos completos
      }
    });
  }
  const hits = response.hits.hits.map((hit: any) => hit._source);
  const total = response.hits.total as { value: number; relation: string };
  return Response.json({ practicas: hits, total: total.value }, { status: 200 }); 
}

export async function POST(req: Request) {
  const body = await req.json();
  // guardar body...
  return Response.json({ creado: body }, { status: 201 });
}



export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5173", // o *
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400", // cachea la preflight 24h
    },
  });
}