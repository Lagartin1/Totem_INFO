import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/loader'; // <-- Usas tu componente
// Asumo que tienes un Header y un Nav_button como en otros archivos
// import Header from '../components/Header'; 
// import Nav_button from '../components/nav_button';

// 1. Define la interfaz para los datos que esperas
// (Debe coincidir con tu tipo 'Practica' del backend)
interface Practica {
  id: string; // O el tipo de ID que uses
  labores: string;
  nombre_empresa: string;
  visitas: number;
}

interface PracticasData {
  practicas: Practica[];
  total: number;
}

// Asumo que tu API_BASE_URL está disponible
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function TopPracticas() {
  const nav = useNavigate();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const baseUrl = BUILD_MODE ? API_BASE_URL : 'http://localhost:3000';

  useEffect(() => {
    // 2. Llama a tu nuevo endpoint
    fetch(`${baseUrl}/api/practicas/top-visitadas`) // <-- El endpoint que creaste
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudieron cargar las prácticas');
        }
        return res.json();
      })
      .then((data: PracticasData) => { // <-- Recibes el objeto
        setPracticas(data.practicas);     // <-- Extraes el array
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [baseUrl]);

  // 3. Renderiza los estados
  if (loading) {
    // <-- Usas tu componente loader
    return <Loader frase="Cargando top de prácticas..." />; 
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{error}</p>
        <button 
          onClick={() => nav(-1)} 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Volver
        </button>
      </main>
    );
  }

  // 4. Muestra la tabla con los resultados
  return (
    <main className="min-h-screen p-6">
      {/* <Header /> */}
      <div className="px-30 py-10">
        {/* <Nav_button Title="Volver" Link="/admin-practicas" /> */}
        <button onClick={() => nav("/admin-practicas")}>Volver</button>
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Prácticas Más Visitadas
        </h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Práctica (Labores)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visualizaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {practicas.map((practica, index) => (
                <tr key={practica.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-900">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{practica.labores}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{practica.nombre_empresa}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-md leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {practica.visitas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}