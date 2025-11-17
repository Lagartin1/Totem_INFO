import { useEffect, useState } from "react";
import Headers from "../Components/Header";
import Card_Becados from "../Components/Card_Becados";
import Nav_button from "../Components/Nav_Button";
import type { Becado } from "../types/index";
import Loading from "../Components/Loader";
import Carousel from "../Components/Carousel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Becados() {
  const [data, setData] = useState<Becado[]>([]);
  const [sData, setSData] = useState<Becado[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";
  
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/becados`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.becados ?? []);
      })
      .catch((err) => console.error("Error en fetch inicial:", err))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Volver a la lista inicial
  const handleVolver = () => {
    setSData([]);
    setHasSearched(false);
  };

  // Datos a mostrar
  const displayedData = hasSearched ? sData : data;

  const slides = displayedData.map((becado) => (
    <Card_Becados
      key={becado.id}
      becado={becado}
    />
  ));

  return (
    <main className="p-6 w-full min-h-screen">
      <Headers />
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/" />
      </div>

      <div className="py-10 flex flex-col items-center gap-6">

        {/* Loading Spinner */}
        {loading && <Loading frase="Cargando becados..." />}

        {/* Lista de resultados */}
        {!loading && displayedData.length > 0 && (
          <>
           <div className="relative w-full">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {!loading && slides.length > 0 && (
                <Carousel key={displayedData.length} slides={slides} />
              )}
            </div>
          </div>

            {/* Botón "Volver" solo si se hizo una búsqueda */}
            {hasSearched && (
              <div className="flex flex-col mt-8 bg-gray-800/20 items-center rounded-3xl">
                <div
                  className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
                  onClick={handleVolver}>
                  <h3 className="text-balance text-2xl p-5 text-white">
                    Volver a la lista
                  </h3>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
