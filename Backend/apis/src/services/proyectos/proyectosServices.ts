
import { ProyectoResult,searchProyectos, searchProyectoValidYear, getProyectos } from "@/models/proyectos/proyectosModels"; // Asegura que las variables de entorno estén tipadas




export async function searchProyectosService(searchTerm: string): Promise<ProyectoResult> {
    let response: ProyectoResult;
    const yearPattern = /^\d{4}$/;
    const year = yearPattern.test(searchTerm) && parseInt(searchTerm) >= 1900 && parseInt(searchTerm) <= new Date().getFullYear() ? searchTerm : null;
    if (year) {
        response = await searchProyectoValidYear(parseInt(searchTerm));
    } else {
        response = await searchProyectos(searchTerm);
    }
    if (!response) {
        throw new Error('No se encontraron proyectos');
    }
    return response;
}

export async function listProyectos(): Promise<ProyectoResult> {
    const response = await getProyectos();   
    if (!response) {
        throw new Error('No se encontraron proyectos');
    }
    return response;
}

