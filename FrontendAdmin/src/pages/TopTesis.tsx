import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/loader'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// --- CAMBIO 1: Define la interfaz de Tesis ---
// (Ajusta esto a los campos reales de tu modelo de Tesis)
interface Tesis {
  id: string; 
  titulo: string; // En lugar de 'labores'
  autores: string; // O 'autor', en lugar de 'nombre_empresa'
  visitas: number;
}
interface TesisData {
  tesis: Tesis[]; // <-- CAMBIO AQUÍ
  total: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

const getISODate = (date: Date) => date.toISOString().split('T')[0];

export default function TopTesis() { // <-- CAMBIO AQUÍ
  const nav = useNavigate();
  const [tesis, setTesis] = useState<Tesis[]>([]); // <-- CAMBIO AQUÍ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<'total' | 'week' | 'month' | 'custom'>('total');

  const baseUrl = BUILD_MODE ? API_BASE_URL : 'http://localhost:3000';

  useEffect(() => {
    setLoading(true);
    setError(null);

    // --- CAMBIO 2: Actualiza la URL ---
    let url = `${baseUrl}/api/tesis/top-visitadas`; // <-- CAMBIO AQUÍ
    
    if (startDate && endDate && activeFilter !== 'total') {
        const start = getISODate(startDate);
        const end = getISODate(endDate);
        url += `?startDate=${start}&endDate=${end}`;
    }

  fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las tesis');
        return res.json();
      })
      .then((data: TesisData) => {
        setTesis(data.tesis);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [baseUrl, startDate, endDate, activeFilter]); // Se ejecuta cuando las fechas cambian

    // --- NUEVAS FUNCIONES DE FILTRO ---
  const setFilter = (filter: 'total' | 'week' | 'month') => {
    setActiveFilter(filter);
    const today = new Date();
    if (filter === 'total') {
        setStartDate(null);
        setEndDate(null);
    } else if (filter === 'week') {
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        setStartDate(lastWeek);
        setEndDate(today);
    } else if (filter === 'month') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        setStartDate(lastMonth);
        setEndDate(today);
    }
  };
    const handleCustomDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setActiveFilter('custom');
  };

  const renderContent = () => {
    if (loading) {
      return <Loader frase="Cargando top de tesis..." />; // <-- CAMBIO AQUÍ
    }
     if (error) {
      return <p className="text-center text-red-600">{error}</p>;
    }

    // --- PUNTO 5: MENSAJE DE "NO HAY DATOS" ---
    if (tesis.length === 0) {
      return (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">
            No se encontraron resultados para el período seleccionado.
          </h3>
        </div>
      );
    }

    if (tesis.length === 0) { // <-- CAMBIO AQUÍ
      return (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">
            No se encontraron resultados para el período seleccionado.
          </h3>
        </div>
      );
    }

    // --- CAMBIO 3: Prepara datos del gráfico ---
    const chartData = tesis.map(t => ({ // <-- CAMBIO AQUÍ
        // Asumiendo que 'titulo' es el campo principal
        name: t.titulo.substring(0, 30) + (t.titulo.length > 30 ? '...' : ''), 
        Visitas: t.visitas
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna de Gráfico */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Gráfico de Visitas</h2>
          {/* El gráfico de recharts es igual */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Visitas" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Columna de Tabla */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 p-6 text-gray-800">Tabla de Visitas</h2>
          {/* --- CAMBIO 4: Actualiza la Tabla --- */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rango</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título de Tesis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor(es)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tesis.map((t, index) => ( // <-- CAMBIO AQUÍ
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="font-bold">{index + 1}</span></td>
                  <td className="px-6 py-4">{t.titulo}</td>
                  <td className="px-6 py-4">{t.autores}</td>
                  <td className="px-6 py-4"><span className="font-semibold text-blue-600">{t.visitas}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      {/* <Header /> */}
      <div className="px-30 py-10">
        <button onClick={() => nav("/admin-practicas")} className="text-blue-600 hover:underline">
          &larr; Volver a Administración
        </button>
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Tesis Más Visitadas {/* <-- CAMBIO AQUÍ */}
        </h1>

{/* --- PUNTO 3: FILTROS DE FECHA --- */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex flex-wrap items-center gap-4">
          <span className="font-semibold">Filtrar por:</span>
          <button
            onClick={() => setFilter('total')}
            className={`px-4 py-2 rounded ${activeFilter === 'total' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Total Histórico
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded ${activeFilter === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded ${activeFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Último Mes
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Personalizado:</span>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={handleCustomDateChange}
              isClearable={true}
              placeholderText="Selecciona un rango"
              className="border p-2 rounded"
            />
          </div>
        </div>
        {/* Contenido dinámico */}
        {renderContent()}
      </div>
    </main>
  );
}