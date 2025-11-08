


import { NextResponse,NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromSessionToken } from '@/lib/auth/login_tools';
import { get } from "http";


export async function GET() {
  try {
    // saca el acceso al token de la cookie 
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    const userId = await getUserIdFromSessionToken(token || '');
    return NextResponse.json({ userId });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}