import { getUserInfo,UserInfo } from "@/models/admin/loginModel";
import { requireCsrf, signAccessToken, setCookie,issueCsrfToken } from "@/lib/auth/login_tools";


export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
}




export async function VerifyLogin(username: string, password: string): Promise<LoginResponse | null> {
   
  const user = await getUserInfo(username) as UserInfo | null;
  if (!user) {
    console.log("User not found");
    throw new Error("User not found");
  }
  if (verifyUser(user, username, password)) {
    
    return {
      id: user.id,
      username: user.username,
      email: user.email || '',
      nombre: user.nombre || '',
      apellido: user.apellido || ''
    };
  }
  throw new Error("Invalid credentials");
}

function verifyUser(user: UserInfo, username: string, password: string): boolean {
  return user.username === username && user.password === password;
}

