import { info } from "console";
import { adminController } from "@/controllers/practicas/practicasController";
import { NextResponse } from "next/server";
import { getUserIdFromSessionToken, verifyAccessToken } from "@/lib/auth/login_tools";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";


export  async function POST(req: NextRequest, { params }: { params: Promise<{ infotype: string }> }) {
  try{
    const { infotype } = await params;
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

    return adminController(req, infotype, userID);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}