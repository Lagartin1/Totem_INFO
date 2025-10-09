import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {ReactNode} from 'react';



interface User {
  id: string;
  username: string;
  email: string;
  nombre?: string;
  apellido?: string;
  createdAt: Date;
  expiresAt?: Date | null;
  // Agrega otros campos según sea necesario
}

interface AuthContextType {
  userData: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user_id: string | null;
  handleSignedIn: (user_id: string) => void;
  handleSignOut: (user_id: string) => void;
  login: (user: string, pwd: string) => Promise<any>;
  logout: () => Promise<void>;

}

const AuthProviderContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ( {children}:{children: ReactNode}) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [user_id, setUser_id] = useState<string | null>(null);
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [warningShown, setWarningShown] = useState(false);

  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  async function login(user: string, pwd: string) {
    try {
      await fetch('/api/admin/auth',
         { method: 'GET', 
          credentials: 'include',
         }); // Solicita el token CSRF
      // Obtener el token CSRF desde la cookie en el navegador
      let csrfToken = getCookie("XSRF-TOKEN");
      console.log("CSRF Token:", csrfToken);
      if (!csrfToken) {
        throw new Error('CSRF token not found in cookies');
      }

      const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || ''
      },
      credentials: 'include',
      body: JSON.stringify({ "username": user, "password": pwd })
      });
      const result = await response.json();
      if (response.ok) {
        setUserData(result.data.user as User);
        await handleSignedIn(result.data.user.id);
        return true;
      } else {
        console.error("Login failed(auth):", result);
        return null;
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    }finally {
      if (mounted.current) setIsLoading(false);
    };
  }

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
    return null;
  }

  async function handleSignedIn(user_id: string) {
    setAuthenticated(true);
    setUser_id(user_id);
  }
  async function handleSignOut(user_id: string) {
    setAuthenticated(false);
    setUser_id(null);
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        handleSignOut(  user_id || '');
        console.log("Logout successful");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  // dentro de AuthProvider
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // intenta recuperar sesión (cookie HttpOnly via credentials)
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!alive) return;

        if (res.ok) {
          const data = await res.json();
          // ajusta a tu formato de respuesta { authenticated, user }
          if (data?.authenticated && data?.user) {
            setUserData(data.user);        // { id, username, email, nombre, apellido, ... }
            setAuthenticated(true);
            setUser_id(data.user.id);
          } else {
            setAuthenticated(false);
            setUser_id(null);
            setUserData(null);
          }
        } else {
          setAuthenticated(false);
          setUser_id(null);
          setUserData(null);
        }
      } catch {
        setAuthenticated(false);
        setUser_id(null);
        setUserData(null);
      } finally {
        if (alive) setIsLoading(false);   // <-- clave
      }
    })();
    return () => { alive = false; };
  }, []);



  const value = {
    userData,
    user_id,
    isAuthenticated,
    handleSignedIn,
    handleSignOut,
    isLoading,
    login,
    logout,
  };

  return <AuthProviderContext.Provider value={value}>{children}</AuthProviderContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthProviderContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}