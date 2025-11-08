import { NextResponse,NextRequest } from 'next/server';

import { issueCsrfToken, setCsrfCookies } from '@/lib/auth/login_tools';
import { refreshController } from '@/controllers/admin/authController';
export async function GET() {
  try {
    const csrfToken = await issueCsrfToken();
    const response = NextResponse.json({ success: true, token: csrfToken }); // ← Temporal para debug
    await setCsrfCookies(csrfToken);
  
    console.log('CSRF token issued and cookies set:', csrfToken);
    return response;
    
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return refreshController(req);
  
}