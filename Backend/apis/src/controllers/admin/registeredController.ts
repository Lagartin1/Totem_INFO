import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/services/admin/registeredService";
import { cookies } from "next/dist/server/request/cookies";
import { verifyAccessToken } from "@/lib/auth/login_tools";

async function registeredController(req: NextRequest) {
  try{
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  
}

export { registeredController };

