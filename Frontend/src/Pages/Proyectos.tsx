import { useEffect, useState } from "react";
import Header from "../Components/Header";
import Card_Proyectos from "../Components/Card_Proyect";
import Search_Bar from "../Components/Search_Bar";
//import Carousel from "../Components/Carousel";



interface ProyectoProps {
  id: string;
  titulo: string;
  area_desarrollo: string;
  correo_contacto: string;
  telefono_contacto: string;
  profesores: string[] | string;
}

export default function ProyectosDocentes() {
  const [data, setData] = useState<ProyectoProps[]>([]);
  const [sData, setSData] = useState<ProyectoProps[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/proyectos")
      .then((res) => res.json())
      .then((json) => setData(json.proyectos ?? []))
      .catch((err) => console.error("Error cargando proyectos:", err));
  }, []);

  const handleSearch = (searchTerm: string) => {
    fetch(
      `http://localhost:3000/api/proyectos?q=${encodeURIComponent(
        searchTerm
      )}`
    )
      .then((res) => res.json())
      .then((json) => setSData(json.proyectos ?? []))
      .catch((err) => console.error("Error en búsqueda:", err));
  };

  const handleVolver = () => setSData([]);

  const displayedData = sData.length > 0 ? sData : data;

  // Generamos los slides para el carrusel
  const slides = displayedData.map((proyecto) => (
    <Card_Proyectos
      key={proyecto.id}
      titulo={proyecto.titulo}
      area={proyecto.area_desarrollo}
      correo={proyecto.correo_contacto}
      telefono={proyecto.telefono_contacto}
      profesores={
        Array.isArray(proyecto.profesores)
          ? proyecto.profesores.join(", ")
          : proyecto.profesores
      }
    />
  ));

  return (
    <main className="min-h-screen p-6">
      <Header />
        <div className="px-30 py-10">
            <Nav_button Title="Volver" Link="/"/>
        </div>
      <div className="py-10 flex flex-col items-center gap-6">
        <Search_Bar onSearch={handleSearch} />

        {sData.length > 0 && (
          <div className="text-2xl font-bold text-gray-700 mb-4">
            Resultados de la búsqueda:
          </div>
        )}

        {/* Carrusel */}
        {slides.length > 0 ? (
          <Carousel slides={slides} />
        ) : (
          <p>No hay proyectos disponibles</p>
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
