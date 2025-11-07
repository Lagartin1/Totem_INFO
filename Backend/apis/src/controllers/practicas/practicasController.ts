import { PracticasResult} from "@/models/practicas/practicasModel";
import { listPracticas, BuscarPracticas ,insertNewPractica} from "@/services/practicas/practicasService";
import { NextRequest,NextResponse } from "next/server";




export async function fetchPracticas(year: string | false,indice: number, type: string): Promise<PracticasResult> {

    const practicasData: PracticasResult= await listPracticas(year, indice, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}



export async function SearchTermPracticas(term: string, type: string): Promise<PracticasResult> {

    const practicasData: PracticasResult = await BuscarPracticas(term, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}



export async function adminController(req: NextRequest,infotype: string) {
    try{
        if (infotype === 'form') {
            const body = await req.json().catch(() => ({} as any)) 
            const result = await insertNewPractica(body);
            if (!result) {
                return new NextResponse(JSON.stringify({ error: 'No se pudo crear la práctica' }), { status: 500 });
            }
            return new NextResponse(JSON.stringify({ ok: true }), { status: 201 });
        } else if (infotype === 'file') {
            // Procesar archivo cargado
            //const body = await req.json();
            // guardar body...
            return new NextResponse(JSON.stringify({ ok: true }), { status: 201 });
        }else{
            return new NextResponse(JSON.stringify({ error: 'Tipo de información no válido' }), { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
}