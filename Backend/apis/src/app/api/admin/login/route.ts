
import { NextResponse } from "next/server"
import { login } from "@/controllers/admin/loginController"
import { requireCsrf, setCookie } from "@/lib/auth/login_tools"
import {LoginResponse} from "@/services/admin/loginService" 

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const csrfHeader = request.headers.get('x-csrf-token');
  console.log(csrfHeader)
  if (!(await requireCsrf(csrfHeader))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  if (!username || !password) {
    return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
  }
  const response = await login(String(username), String(password));
  if (!response) {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }
  setCookie('auth_token', 'dummy_token_value', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 30 * 60 });
  return NextResponse.json({ ok: true, data: response as LoginResponse });  

  }