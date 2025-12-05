import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminController } from '@/controllers/practicas/practicasController';
import { getUserByCredentials } from '@/models/admin/userModel';
import { verifyAccessToken } from '@/lib/auth/login_tools';



export async function POST(req: NextRequest) { 
    try {
        // El middleware ya verificó el access_token
        const userID = await getUserByCredentials('syncronizer').then(user => user?.id);

        if (!userID) {
            console.log('User syncronizer not found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('User ID resolved:', userID);
        const infotype = 'file'; // Asumimos que siempre es carga masiva por CSV
        return await adminController(req, infotype, userID);

    } catch (error) {
        console.error('Error en POST /admin/administrar/practicas/syncronizer:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}