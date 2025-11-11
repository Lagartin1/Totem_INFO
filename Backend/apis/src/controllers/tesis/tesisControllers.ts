import { 
  TesisResults, 
  GetTesisByID, 
  incrementTesisVisits, 
  getTopTesisHistorico, 
  getTopTesisByDateRange 
} from '@/models/tesis/tesisModels';

import { listTesis} from '@/services/tesis/tesisService';
import { addLogEntry } from "@/models/admin/logModel"; 
import { NextResponse } from 'next/server';

export async function tesisController(searchTerm: string|false){
    let response: TesisResults;
    if (!searchTerm) {
        response = await listTesis();
    } else {
        response = await listTesis();
    }
    if (!response) {
        throw new Error("Error fetching tesis data");
    }
    return response;
}

export async function getTesisDetails(id: string) {
    try {
        // 1. Registra la visita en el log (asincrónico, no bloquea)
        addLogEntry('visitante', 'view_tesis', 'tesis', id).catch(console.error);
        
        // 2. Incrementa el contador total (asincrónico, no bloquea)
        incrementTesisVisits(id).catch(console.error);

        // 3. Obtiene los datos de la tesis para mostrar
        const tesis = await GetTesisByID(id);

        if (!tesis) {
            return new NextResponse(
                JSON.stringify({ error: "Tesis no encontrada" }), 
                { status: 404 }
            );
        }

        return new NextResponse(JSON.stringify(tesis), { status: 200 });

    } catch (error) {
        console.error("Error en getTesisDetails:", error);
        return new NextResponse(
            JSON.stringify({ error: "Error interno del servidor" }), 
            { status: 500 }
        );
    }
}

/**
 * Controlador para la página de estadísticas Top Tesis.
 * Decide qué modelo llamar basado en los filtros de fecha.
 */
export async function getTopClickedTesis(startDate?: string, endDate?: string) {
    try {
        let result: TesisResults;
        
        if (startDate && endDate) {
            // 1. Lógica de rango de fechas (basada en logs)
            result = await getTopTesisByDateRange(startDate, endDate);
        } else {
            // 2. Lógica histórica (basada en contador 'visitas')
            result = await getTopTesisHistorico(10);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("[TOP_TESIS_GET] Error:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Error interno del servidor' }), 
            { status: 500 }
        );
    }
}