import { useEffect, useState, useRef } from "react";
import type { Noticia } from "../types/index";
import Carousel_Main from "../Components/Carousel_Main";
import Modal_Noticias from "./Modal_Noticias";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Noticias_Section() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/noticias`)
      .then((res) => res.json())
      .then((json) => setNoticias(json.noticias ?? []))
      .catch((err) => console.error("Error en fetch inicial:", err))
      .finally(() => setLoading(false));
  }, []);

    const handleSelectNoticia = (noticia: Noticia) => {
      setSelectedNoticia(noticia);
    };

    return (
      <div className="p-6 mt-20">

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
        <div className="mt-15">
          <Carousel_Main
            noticias={noticias}
            onSelect={handleSelectNoticia}
          />
        </div>

      {/* Modal de noticia */}
      <Modal_Noticias
        isOpen={!!selectedNoticia}
        onClose={() => setSelectedNoticia(null)}
        noticia={selectedNoticia}
      />
    </div>
  );
}
