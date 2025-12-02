import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {adminController} from '@/controllers/practicas/practicasController';
import {getUserByCredentials} from '@/models/admin/userModel';



export async function POST(req: NextRequest) { 

    const jar = await cookies();
    const accessToken = jar.get('access_token')?.value;

    if (!accessToken) {
        console.log('No access token found in cookies');
        return new Response('Unauthorized', { status: 401 });
    }
    console.log('Access Token received:', accessToken);

    // Aquí podrías validar el token de acceso si es necesario

    const userID = await getUserByCredentials('syncronizer').then(user => user?.id);

    if (!userID) {
        return new Response('Unauthorized', { status: 401 });
    }
    console.log('User ID resolved:', userID);
    const infotype = 'file'; // Asumimos que siempre es carga masiva por CSV
    return await adminController(req, infotype, userID);



}