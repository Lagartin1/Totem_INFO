import { useEffect, useState } from "react";
import Header from "../Components/Header";
import Card_Tesis from "../Components/Card_Tesis";
import Search_Bar from "../Components/Search_Bar";
import Nav_button from "../Components/nav_button";
import Carousel from "../Components/Carousel";

interface TesisProps {
  id: string;
  titulo: string;
  area_desarrollo: string;
  autor: string;

}

export default function ProyectosDocentes() {
  const [data, setData] = useState<TesisProps[]>([]);
  const [sData, setSData] = useState<TesisProps[]>([]);
  const [hasSearched, setHasSearched] = useState(false); 

  useEffect(() => {
    fetch("http://localhost:3000/api/tesis")
      .then((res) => res.json())
      .then((json) => setData(json.tesis ?? []))
      .catch((err) => console.error("Error cargando tésis:", err));
  }, []);

  const handleSearch = (searchTerm: string) => {
    setHasSearched(true);
    fetch(
      `http://localhost:3000/api/tesis?q=${encodeURIComponent(
        searchTerm
      )}`
    )
      .then((res) => res.json())
      .then((json) => setSData(json.tesis ?? []))
      .catch((err) => console.error("Error en búsqueda:", err));
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

        {hasSearched && sData.length === 0 ? (
          <div className="text-2xl font-bold text-red-600">
            No se encontraron resultados para tu búsqueda
          </div>
        ) : (
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
        )}

        {sData.length > 0 && (
          <div className="flex flex-col mt-10 items-center rounded-3xl">
            <div
              className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
              onClick={handleVolver}
            >
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
