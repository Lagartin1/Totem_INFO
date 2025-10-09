
import { NextResponse,NextRequest } from 'next/server';
import { revokeRefreshToken, deleteCookie } from '@/lib/auth/login_tools';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }
  
  await deleteCookie('access_token');
  await deleteCookie('refresh_token');
  
  return NextResponse.json({ ok: true });
}