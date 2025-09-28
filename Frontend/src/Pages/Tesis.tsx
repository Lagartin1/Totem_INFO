import { useEffect, useState } from "react";
import Card_Tesis from "../Components/Card_Tesis";
import Carousel from "../Components/Carousel";
import Header from "../Components/Header";
import Search_Bar from "../Components/Search_Bar";
import Nav_button from "../Components/nav_button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TesisProps {
  id: string;
  titulo: string;
  area_desarrollo: string;
  autor: string;
  resumen: string;
}

export default function ProyectosDocentes() {
  const [data, setData] = useState<TesisProps[]>([]);
  const [sData, setSData] = useState<TesisProps[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false); // 🔹 nuevo estado de carga

  const baseUrl = API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/tesis`)
      .then((res) => res.json())
      .then((json) => setData(json.tesis ?? []))
      .catch((err) => console.error("Error cargando tésis:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (searchTerm: string) => {
    setHasSearched(true);
    setLoading(true);
    fetch(`${baseUrl}/api/tesis?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((json) => setSData(json.tesis ?? []))
      .catch((err) => console.error("Error en búsqueda:", err))
      .finally(() => setLoading(false));
  };

  const handleVolver = () => {
    setSData([]);
    setHasSearched(false);
  };

  const displayedData = sData.length > 0 ? sData : data;

  const slides = displayedData.map((tesis) => (
    <Card_Tesis
      key={tesis.id}
      titulo={tesis.titulo}
      area={tesis.area_desarrollo}
      autor={tesis.autor}
      resumen={tesis.resumen}
    />
  ));

  return (
    <main className="min-h-screen p-6">
      <Header />
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/" />
      </div>

      <div className="py-10 flex flex-col items-center gap-6">
        <Search_Bar onSearch={handleSearch} />

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando...</p>
          </div>
        )}

        {/* Resultados / Mensajes */}
        {!loading && hasSearched && sData.length === 0 ? (
          <div className="text-2xl font-bold text-red-600">
            No se encontraron resultados para tu búsqueda
          </div>
        ) : (
          !loading && (
            <>
              {sData.length > 0 && (
                <div className="text-2xl font-bold text-gray-700 mb-4">
                  Resultados de la búsqueda:
                </div>
              )}
              {slides.length > 0 ? (
                <Carousel slides={slides} />
              ) : (
                <p>No hay tésis disponibles</p>
              )}
            </>
          )
        )}

        {!loading && hasSearched && (
          <div className="flex flex-col mt-10 items-center rounded-3xl">
            <div
              className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
              onClick={handleVolver}>
              <h3 className="text-balance text-2xl p-5 text-white">
                Volver a la lista
              </h3>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
