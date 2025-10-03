import {searchProyectosService, listProyectos} from "@/services/proyectos/proyectosServices"
import { ProyectoResult } from "@/models/proyectos/proyectosModels";

export async function proyectosController(searchTerm?: string): Promise<ProyectoResult> {

    let response: ProyectoResult;

    if (searchTerm) {
        response = await searchProyectosService(searchTerm);
    } else {
        response = await listProyectos();
    }
    if (!response) {
        throw new Error('No se encontraron proyectos');
    }
    
    return response;
}