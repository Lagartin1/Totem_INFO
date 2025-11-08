import { NextResponse,NextRequest} from 'next/server';
import {adminDeletePractica} from '@/controllers/practicas/practicasController';
import {cookies} from 'next/headers';
import { getUserIdFromSessionToken, verifyAccessToken } from '@/lib/auth/login_tools';

export async function DELETE(req: NextRequest) {
  try{
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const refreshToken = jar.get('refresh_token')?.value;
    const userID = await getUserIdFromSessionToken(refreshToken || '');
    if (!userID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } 

    return adminDeletePractica(req, userID);  



  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
  
}