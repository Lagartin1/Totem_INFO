import React from 'react';
import {  useNavigate } from 'react-router-dom';

export default function Dashboard() { 
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate('/load-data');
  }

  return (
    <main className='p-6 w-full min-h-screen '>
      <div className='mb-1 bg-white shadow-md rounded-lg h-lvh flex flex-col justify-center items-center'>
        <div className="w-full max-w-4xl">
          <h1 className='text-3xl font-bold mb-6'>Panel de Administración</h1>
          <p>Bienvenido al panel de administración.</p> 
        </div>
        <div className='flex flex-col justify-center items-center'>
          <button
            onClick={() => {
              // Redirigir a la página de carga de datos
              handleOnClick();
            }}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
          >
            Cargar Datos
          </button>
        </div>

      </div>
    
    </main>
  );
} 
  