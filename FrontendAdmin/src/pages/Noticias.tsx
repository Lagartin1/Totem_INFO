import { useEffect, useState, useRef } from "react";
import NoticiaCard from "../components/Card_Noticias";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Noticias from "../components/Modal_Agregar_Noticias";
import type { Noticia } from "../types/index";
import Nav_button from "../components/nav_button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function NoticiasSection() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Función para cargar noticias
  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/noticias`);
      const json = await res.json();
      setNoticias(json.noticias ?? []);
    } catch (err) {
      console.error("Error al obtener noticias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onClick = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
    console.log("Noticia seleccionada:", noticia);
  };

  return (
    <main className="p-6 w-full min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Noticias</h2>
        <div className="px-30 py-10">
          <Nav_button Title="Volver" Link="/dashboard" />
        </div>

      <div className="p-6">

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando...</p>
          </div>
        )}

        {!loading && noticias.length === 0 && (
          <p className="text-gray-500">No hay noticias disponibles</p>
        )}

        {/* Carrusel de noticias */}
        <div className="relative">
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4">
            {noticias.map((n) => (
              <NoticiaCard
                key={n.id}
                noticia={n}
                onClick={() => onClick(n)}
                onDelete={(id) =>
                  setNoticias((prev) => prev.filter((x) => x.id !== id))
                }
                onAdded={fetchNoticias}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto w-64 text-white p-4">
          <Boton_Landing Title="Agregar Noticia" onClick={openModal} />
        </div>

        <Modal_Agregar_Noticias
          isOpen={isModalOpen}
          closeModal={closeModal}
          onAdded={fetchNoticias}
        />
      </div>
    
    </main>
  );
}
