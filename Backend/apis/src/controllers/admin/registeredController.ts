import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/services/admin/registeredService";
import { cookies } from "next/dist/server/request/cookies";
import { verifyAccessToken } from "@/lib/auth/login_tools";
import { ok } from "assert";

async function registeredController(req: NextRequest, pagina:string) {
  try{
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getUserFromRequest(pagina);
    if (!user) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }
    return NextResponse.json({ok: true, users: user.users, total: user.total}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  
}

export { registeredController };

