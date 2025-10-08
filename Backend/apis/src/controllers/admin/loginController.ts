
import { VerifyLogin,LoginResponse } from "../../services/admin/loginService";


export async function login(username: string, password: string): Promise<LoginResponse | null> {
  try{
    const result = await VerifyLogin(username, password);
    if (!result) {
      return null;
    }
    return result;

  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}  