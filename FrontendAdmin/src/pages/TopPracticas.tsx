import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader'; 
import Nav_button from "../components/Nav_Button"; // Usando tu componente existente
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Interfaz adaptada a lo que devuelve tu API (Prisma)
interface Practica {
  id: string; 
  labores: string;     // O 'titulo' si prefieres mostrar eso
  nombre_empresa: string;  
  visitas: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function TopPracticas() {
  const nav = useNavigate();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = BUILD_MODE ? API_BASE_URL : 'http://localhost:3000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Llamamos directamente sin parámetros de fecha, ya que el backend devuelve el histórico
        const res = await fetch(`${baseUrl}/api/practicas/top-visitadas`);
        
        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        const json = await res.json();
        console.log("Datos Top Prácticas:", json);

        // LÓGICA DE SEGURIDAD: Detectar si es Array o Objeto
        let dataToUse: Practica[] = [];
        
        if (Array.isArray(json)) {
            dataToUse = json; // El backend nuevo suele mandar array directo
        } else if (json.practicas && Array.isArray(json.practicas)) {
            dataToUse = json.practicas; // Formato antiguo
        } else if (json.data && Array.isArray(json.data)) {
            dataToUse = json.data;
        }

        setPracticas(dataToUse);

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]); 

  const renderContent = () => {
    if (loading) {
      return <Loader frase="Cargando estadísticas..." />;
    }

    if (error) {
      return (
        <div className="p-10 text-center bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 font-semibold">{error}</p>
        </div>
      );
    }

    if (practicas.length === 0) {
      return (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">
            Aún no hay visitas registradas en el sistema.
          </h3>
        </div>
      );
    }

    // Preparamos datos para Recharts
    const chartData = practicas.map(p => ({
        name: (p.labores || p.nombre_empresa || "Sin título").substring(0, 20) + "...",
        full_name: p.labores,
        empresa: p.nombre_empresa,
        Visitas: p.visitas
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Columna de Gráfico */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Gráfico de Visitas</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                <Tooltip 
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-white p-2 border shadow-lg rounded text-sm">
                                <p className="font-bold">{data.full_name}</p>
                                <p className="text-gray-600">{data.empresa}</p>
                                <p className="text-blue-600 font-semibold">Visitas: {data.Visitas}</p>
                            </div>
                        );
                        }
                        return null;
                    }}
                />
                <Legend />
                <Bar dataKey="Visitas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columna de Tabla */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 p-6 pb-0 text-gray-800">Tabla de Detalles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Práctica / Labores</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {practicas.map((practica, index) => (
                    <tr key={practica.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{practica.labores}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{practica.nombre_empresa}</td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {practica.visitas}
                        </span>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header con Botón Volver */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Nav_button Title="Volver" Link="/dashboard" />
            <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-right flex-grow">
                Prácticas Más Visitadas (Histórico)
            </h1>
        </div>

        {/* Contenido Principal */}
        {renderContent()}
      </div>
    </main>
  );
}