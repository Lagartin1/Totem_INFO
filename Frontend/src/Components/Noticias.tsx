import { useEffect, useState, useRef } from "react";
import NoticiaCard from "./Card_Noticias";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export interface Noticia {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  autor: string;
  fecha_publicacion: string;
  imagen?: string;
}

export default function NoticiasSection() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);


  const carouselRef = useRef<HTMLDivElement>(null);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/noticias`)
      .then((res) => res.json())
      .then((json) => setNoticias(json.noticias ?? []))
      .catch((err) => console.error("Error en fetch inicial:", err))
      .finally(() => setLoading(false));
  }, []);

  const onClick = (noticia: Noticia) => {
    setSelectedNoticia(noticia);
    selectedNoticia && console.log("Noticia seleccionada:", selectedNoticia);
  }


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Noticias</h2>

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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
