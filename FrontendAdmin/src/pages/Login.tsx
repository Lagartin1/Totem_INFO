import React, { use, useEffect, useState } from 'react';
import { useAuth } from '../lib/authProvider';
import { useNavigate } from 'react-router-dom';


export default function Home() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, isAuthenticated} = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUser(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  // --- estado del modal de registro ---
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
    return null;
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReg(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setRegError(null);

  // Validación básica
  if (!reg.firstName || !reg.lastName || !reg.email || !reg.username || !reg.password) {
    setRegError("Completa todos los campos.");
    return;
  }
  if (reg.password.length < 8) {
    setRegError("La contraseña debe tener al menos 8 caracteres.");
    return;
  }
  if (reg.password !== reg.confirmPassword) {
    setRegError("Las contraseñas no coinciden.");
    return;
  }

  setRegLoading(true);
  try {
    // 1) CSRF
    await fetch('/api/admin/auth', { method: 'GET', credentials: 'include' });
    const csrf = getCookie("XSRF-TOKEN");
    if (!csrf) {
      setRegError("No se pudo obtener el token CSRF.");
      return;
    }

    // 2) Registro
    const res = await fetch('/api/admin/auth/register', {
      method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf
        },
        body: JSON.stringify({
          nombre:   reg.firstName,   // ajusta si tu API usa otro nombre
          apellido: reg.lastName,    // idem
          email:    reg.email,
          username: reg.username,
          password: reg.password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // intenta mostrar mensaje de backend si existe
        setRegError(data?.message || "No se pudo completar el registro.");
        return;
      }

      // 3) (Opcional) Autologin + cerrar modal
      const logged = await login(reg.username, reg.password);
      if (!logged?.ok) {
        // si el login falla, al menos informa que la cuenta se creó
        setRegError("Cuenta creada, pero no se pudo iniciar sesión automáticamente.");
        return;
      }

      // Éxito: limpia, cierra modal
      setReg({
        firstName: "", lastName: "", email: "",
        username: "", password: "", confirmPassword: ""
      });
      setRegError(null);
      closeModal();

    } catch (err) {
      console.error(err);
      setRegError("Error al conectar con el servidor.");
    } finally {
      setRegLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(user, password);

    if (!result.ok) {
      setErrorMsg(result.message);
      return;
    }

    setErrorMsg(null);
  };
  const handleCloseModal = () => {
    setReg({
      firstName: "", lastName: "", email: "",
      username: "", password: "", confirmPassword: ""
    });
    setRegError(null);
    closeModal();
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);


  return (
    <main>
      <div className="min-h-screen flex items-center justify-center" >
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
            <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Ingresa a tu cuenta
            </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
              <input
                type="text"
                name='username'
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="usuario"
                onChange={handleChange} 
              />
              </div>
              <div>
              <input
                type="password"
                name='password'
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="contraseña"
                onChange={handleChange}
              />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              {errorMsg && (
                <p className="text-red-600 text-sm font-semibold p-4 mx-5 bg-red-100 rounded-md mb-4">
                  {errorMsg}
                </p>
              )}
              <button
              type="submit"
              id='login-button'
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
              Iniciar sesión
              </button>
              <div className="flex justify-center items-center mt-4 gap-2">
                <p className="text-gray-700">¿No tienes una cuenta?</p>

                <button
                  type="button"
                  className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                  onClick={openModal}
                >
                  Regístrate aquí
                </button>
              </div>
            </div>
          </form>
          {isModalOpen && (
                <div className="fixed inset-0 bg-black/5 w-full h-full top-1/2 left-1/2 
                                transform -translate-x-1/2 -translate-y-1/2 transition 
                                ease-out inset backdrop-blur-sm flex items-center justify-center z-50 ">
                    <div className='flex flex-col h-[70vh] w-[60vw] bg-white rounded-xl text-justify items-center'>
                        <div className="px-8 w-full">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="mt-15 text-2xl font-bold text-gray-900">Crear nueva cuenta</h2>
                            <button
                              onClick={closeModal}
                              className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                              ×
                            </button>
                          </div>
                          
                          <form className="space-y-4">
                            <div>
                              <input
                                type="text"
                                name="firstName"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nombre"
                                value={reg.firstName}
                                onChange={handleRegisterChange}
                              />
                            </div>
                            
                            <div>
                              <input
                                type="text"
                                name="lastName"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Apellido"
                                value={reg.lastName}
                                onChange={handleRegisterChange}
                              />
                            </div>
                            
                            <div>
                              <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Correo electrónico"
                                value={reg.email}
                                onChange={handleRegisterChange}
                              />
                            </div>
                            
                            <div>
                              <input
                                type="text"
                                name="username"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Usuario"
                                value={reg.username}
                                onChange={handleRegisterChange}
                              />
                            </div>
                            
                            <div>
                              <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Contraseña"
                                value={reg.password}
                                onChange={handleRegisterChange}
                              />
                            </div>
                            
                            <div>
                              <input
                                type="password"
                                name="confirmPassword"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Confirmar contraseña"
                                value={reg.confirmPassword}
                                onChange={handleRegisterChange}
                              />
                            </div>
                            
                            <div className="flex gap-4 mt-6">
                              <button
                                type="submit"
                                id='register-button'
                                onClick={handleRegisterSubmit}
                                disabled={regLoading}
                                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"

                              >
                                Registrarse
                              </button>
                              
                              <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                              >
                                Cancelar
                              </button>
                    
                            </div>
                          </form>
                        </div>
                        <div className="px-8 w-full mt-4">
                          {isModalOpen && regError && (
                            <p className="text-red-600 text-sm font-semibold p-4 mx-5 bg-red-100 rounded-md mb-4">
                              {regError}
                            </p>
                          )}
                        </div>
                                            
                    </div>
                </div>
                   
            )}
        </div>
      </div>
    </main>
  )
}