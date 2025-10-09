import React, { use, useEffect, useState } from 'react';
import { useAuth } from '../lib/authProvider';
import { useNavigate } from 'react-router-dom';


export default function Home() {
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, isAuthenticated} = useAuth();
  const navigate = useNavigate();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUser(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(user, password);
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
            <div>
              <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            
              >
              Iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}