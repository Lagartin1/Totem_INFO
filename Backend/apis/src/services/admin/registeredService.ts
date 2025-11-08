import { getRegisteredUsers } from "@/models/admin/registeredUsersModel";
import { UserInfo } from "@/models/admin/userModel";

async function getUserFromRequest() {
  try {
    // Lógica para obtener el usuario desde la solicitud
    const user = await getRegisteredUsers() as UserInfo[];
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error fetching registered users");
  }
  
}


export { getUserFromRequest };