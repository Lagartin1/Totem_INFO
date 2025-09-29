import { useEffect, useState } from "react";
import Headers from "../Components/Header";
import CardBecados from "../Components/List_Becados";
import Search_Bar from "../Components/Search_Bar";
import Nav_button from "../Components/nav_button";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Becado {
  id: number;
  nombre: string;
  titulo: string;
  descripcion: string;
}

interface BecadosResponse {
  becados: Becado[];
  total: number;
}

export default function Becados() {
  const [data, setData] = useState<Becado[]>([]);
  const [sData, setSData] = useState<Becado[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseUrl = API_BASE_URL || 'http://localhost:3000';


  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/becados`)
      .then((res) => res.json())
      .then((json) => {setData(json.becados ?? []);})
      .catch((err) => console.error("Error en fetch inicial:", err))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setHasSearched(true);
    setLoading(true);

    fetch(`${baseUrl}/api/becados?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((json) => {
        setSData(json.becados ?? []);
      })
      .catch((err) => console.error("Error en búsqueda:", err))
      .finally(() => {
        setLoading(false);
      });
  };


  // 🔹 Volver a la lista inicial
  const handleVolver = () => {
    setSData([]);
    setHasSearched(false);
  };

  // Datos a mostrar
  const displayedData = hasSearched ? sData : data;

  return (
    <main className="min-h-screen p-6">
      <Headers />
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/" />
      </div>

      <div className="py-10 flex flex-col items-center gap-6">
        <Search_Bar onSearch={handleSearch} />

        {/* 🔹 Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando...</p>
          </div>
        )}

        {/* Resultados de la búsqueda */}
        {!loading && hasSearched && sData.length > 0 && (
          <div className="text-2xl font-bold text-gray-700 mb-4">
            Resultados de la búsqueda:
          </div>
        )}

        {/* No hay resultados */}
        {!loading && hasSearched && sData.length === 0 && (
          <>
            <div className="text-xl font-semibold text-red-600 my-6">
              No se encontraron resultados
            </div>
            <div className="flex flex-col mt-8 bg-gray-800/20 items-center rounded-3xl">
              <div
                className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
                onClick={handleVolver}
              >
                <h3 className="text-balance text-2xl p-5 text-white">
                  Volver a la lista
                </h3>
              </div>
            </div>
          </>
        )}

        {/* Lista de resultados */}
        {!loading && displayedData.length > 0 && (
          <div className="flex flex-col gap-4 w-full max-w-6xl">
            {displayedData.map((b) => (
              <CardBecados
                key={b.id}
                nombre={b.nombre}
                titulo={b.titulo}
                exp={b.descripcion}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
