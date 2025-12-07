import {PracticasResult,PracticaCSV,GetPracticas,GetPracticasByYear,SearchTermPracticas,CreateNewPractica,CreateBulkPracticas,DeletePracticaByID,desactivePracticaByID, GetPracticaYears} from "@/models/practicas/practicasModel";

// Headers requeridos para la validación del CSV
const requiredHeaders = [
    'marca_temporal',
    'tipo_practica',
    'nombre_contacto',
    'cargo_contacto',
    'correo_contacto',
    'telefono_contacto',
    'nombre_empresa',
    'sitio_web_empresa',
    'unidad_empresa',
    'fechas_practica',
    'modalidad',
    'sede_practica',
    'regimen_trabajo',
    'labores',
    'beneficios',
    'requisitos_especiales'
];

const PAGE_SIZE = 6; // Definimos un tamaño de página por defecto para el servicio (coincide con frontend)

export async function listPracticas(year: string | false, indice: number, type: string): Promise<PracticasResult> {
    console.log("listPracticas params:", { year, indice, type });

    let practicasData: PracticasResult;

    // Si nos pasan un año válido (string), obtenemos prácticas y filtramos por año usando la "fecha efectiva"
    if (year && typeof year === 'string') {
        // Obtener candidatas (usamos GetPracticas para luego filtrar; si la fuente está paginada,
        // esto asume que la página solicitada contiene las prácticas que interesan).
        
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum)) {
            throw new Error("Año inválido");
        }
        const candidates = await GetPracticasByYear(type, year);
        
        const start = new Date(yearNum, 0, 1);
        const end = new Date(yearNum + 1, 0, 1);

        const filtered = filterAndSortByEffectiveDate(candidates, start, end);

        practicasData = {
            // Mantener la estructura PracticasResult (practicas + posible total)
            practicas: filtered,
            total: filtered.length
        } as PracticasResult;
    } else {
        // Sin año: comportamiento normal paginado
        practicasData = await GetPracticas(type, indice);
    }

    if (!practicasData || practicasData.practicas.length === 0) {
        throw new Error("No se encontraron prácticas");
    }

    return practicasData;
}

// Actualizamos para aceptar 'indice' y soportar paginación en búsquedas
export async function BuscarPracticas(term: string, type: string, indice: number): Promise<PracticasResult> {
    const practicasData: PracticasResult = await SearchTermPracticas(term, type, indice, PAGE_SIZE);

    if (!practicasData || practicasData.practicas.length === 0) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}



export async function GetAvailablePracticaYears(tipo_practica: string): Promise<any> {
    try {
        const years = await GetPracticaYears(tipo_practica);
        return years;
    } catch (error) {
        console.error("Error en GetAvailablePracticaYears (servicio):", error);
        throw new Error("Error al obtener los años de prácticas desde el servicio");
    }
}

















export async function insertNewPractica(data: any, userId: string): Promise<PracticasResult> {
    // ELIMINADO: const lastID = await GetLastPracticaId(); 
    // Ahora Prisma genera el ID automáticamente; se requiere userId para autorId
    const createdResult = await CreateNewPractica(data, userId);
    
    if (!createdResult || !createdResult.practicas || createdResult.practicas.length === 0) {
        throw new Error('No se pudo crear la práctica');
    }

    // CreateNewPractica ya retorna PracticasResult
    return createdResult;
}


export async function insertCsvPracticas(dataArray: any[],userID: string): Promise<PracticaCSV> {
    // ELIMINADO: const lastID = await GetLastPracticaId();
    // Pasamos directamente el array de datos limpios
    const practicasDataArray = await CreateBulkPracticas(dataArray, userID) as PracticaCSV;
    
    if (!practicasDataArray || (practicasDataArray.total === 0 && practicasDataArray.errors.length > 0)) {
        throw new Error('No se pudieron crear las prácticas o hubo errores en la carga masiva');
    }
    return practicasDataArray;
}


// --- Funciones Utilitarias (Sin cambios lógicos, solo mantenemos la estructura) ---

export function csvToJson(csv: string): any[] {
    const rows: string[][] = [];
    let curRow: string[] = [];
    let curField = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const ch = csv[i];

        if (ch === '"') {
            if (inQuotes && csv[i + 1] === '"') {
                curField += '"';
                i++; 
            } else {
                inQuotes = !inQuotes; 
            }
            continue;
        }

        if (ch === ',' && !inQuotes) {
            curRow.push(curField);
            curField = '';
            continue;
        }

        if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && csv[i + 1] === '\n') i++;
            curRow.push(curField);
            if (!(curRow.length === 1 && curRow[0] === '')) {
                rows.push(curRow);
            }
            curRow = [];
            curField = '';
            continue;
        }
        curField += ch;
    }

    if (curField !== '' || curRow.length > 0) {
        curRow.push(curField);
        if (!(curRow.length === 1 && curRow[0] === '')) {
            rows.push(curRow);
        }
    }

    if (rows.length === 0) return [];

    const headers = rows.shift()!.map(h => h.trim());
    const result = rows.map(row => {
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
            let value = row[j] ?? '';
            value = value.trim();
            obj[headers[j]] = value;
        }
        return obj;
    });

    return result;
}


export function CleanArray(dataArray: any[]): any[] {
    const cleanedDataArray = dataArray.filter((item) => {
        for (const key of requiredHeaders) {
            // Validación simple para asegurar que campos requeridos no estén vacíos
            if ((key !== 'beneficios' && key !== 'requisitos_especiales') && (!item[key] || item[key].trim() === '')) {
                return false;
            }
        }
        return true;
    });
    return cleanedDataArray;    
}


export function validatePracticaData(data: any): boolean {
    if (!data || data.length === 0) return false;
    const fileHeaders = Object.keys(data[0]);
    const hasAllHeaders = requiredHeaders.every(header => fileHeaders.includes(header));
    if (!hasAllHeaders) {
        console.error('El archivo CSV no contiene el formato o las cabeceras necesarias');
        return false;
    }
    return true;
}

export function deletePractica(id: string): Promise<boolean> {
    return DeletePracticaByID(id);
}   

export async function togglePracticaState(id: string): Promise<boolean | { error: string }> {
    try {
        const result = await desactivePracticaByID(id);
        if (typeof result === 'boolean') {
            return result;
        }
        return { error: 'Error al cambiar el estado de la práctica' };
    } catch (error) {
        console.error('Error al cambiar el estado de la práctica:', error);
        return { error: 'Error al cambiar el estado de la práctica' };
    }
}


// Helper: obtener la "fecha efectiva" de una práctica (preferir fecha_practica si es mayor)
function getEffectiveDate(practica: any): Date | null {
  const created = practica.created_at ? new Date(practica.created_at) : null;
  const fecha = practica.fecha_practica ? new Date(practica.fecha_practica) : null;

  if (!created && !fecha) return null;
  if (created && fecha) return fecha.getTime() > created.getTime() ? fecha : created;
  return fecha || created;
}

// Helper interno: filtrar y ordenar prácticas por año usando la fecha efectiva
function filterAndSortByEffectiveDate(candidates: any[], start: Date, end: Date): any[] {
  const filtered = candidates.filter((p: any) => {
    const effective = getEffectiveDate(p);
    if (!effective) return false;
    return effective.getTime() >= start.getTime() && effective.getTime() < end.getTime();
  });

  filtered.sort((a: any, b: any) => {
    const aEff = getEffectiveDate(a)!;
    const bEff = getEffectiveDate(b)!;
    return bEff.getTime() - aEff.getTime();
  });

  return filtered;
}
