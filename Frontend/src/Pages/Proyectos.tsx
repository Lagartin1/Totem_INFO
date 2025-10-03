import { useEffect, useState } from "react";
import Header from "../Components/Header";
import Card_Proyectos from "../Components/Card_Proyect";
import Search_Bar from "../Components/Search_Bar";
import Nav_button from "../Components/nav_button";
import Carousel from "../Components/Carousel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;


interface ProyectoProps {
  id: string;
  titulo: string;
  area_desarrollo: string;
  correo_contacto: string;
  telefono_contacto: string;
  descripcion: string;
  profesores: string[] | string;
}

export default function ProyectosDocentes() {
  const [data, setData] = useState<ProyectoProps[]>([]);
  const [sData, setSData] = useState<ProyectoProps[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : 'http://localhost:3000';

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/proyectos`)
      .then((res) => res.json())
      .then((json) => {setData(json.proyectos ?? []);})
      .catch((err) => console.error("Error en fetch inicial:", err))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  //
  const handleSearch = (searchTerm: string) => {
    setHasSearched(true);
    setLoading(true);

    fetch(
      `${baseUrl}/api/proyectos?q=${encodeURIComponent(searchTerm)}`
    )
      .then((res) => res.json())
      .then((json) => {
        setSData(json.proyectos ?? []);
      })
      .catch((err) => console.error("Error en búsqueda:", err))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVolver = () => {
    setSData([]);
    setHasSearched(false);
  };

  // Datos a mostrar
  const displayedData = hasSearched ? sData : data;

  // Generamos los slides para el carrusel
  const slides = displayedData.map((proyecto) => {
    return (
      <Card_Proyectos
        key={proyecto.id}
        titulo={proyecto.titulo}
        area={proyecto.area_desarrollo}
        correo={proyecto.correo_contacto}
        telefono={proyecto.telefono_contacto}
        descripcion={proyecto.descripcion} 
        profesores={
          Array.isArray(proyecto.profesores)
            ? proyecto.profesores.join(", ")
            : proyecto.profesores
        }
      />
    );
  });

  return (
    <main className="min-h-screen p-6">
      <Header />
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
            <div className="flex flex-col mt-30 bg-gray-800/20 items-center rounded-3xl">
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

        {/* Carrusel de resultados */}
        {!loading && slides.length > 0 && (
          <Carousel key={displayedData.length + sData.length} slides={slides} />
        )}
      </div>
    </main>
  );
}
