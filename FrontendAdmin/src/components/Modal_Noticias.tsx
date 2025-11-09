import { createPortal } from "react-dom";
import type { Noticia } from "../types/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface NoticiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticia: Noticia | null;
}

export default function NoticiaModal({ isOpen, onClose, noticia }: NoticiaModalProps) {
  if (!isOpen || !noticia) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return createPortal(
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/20 backdrop-blur-md
        transition-all duration-300
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6
          max-h-[80vh] overflow-y-auto relative
          transform transition-all duration-300
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen de la noticia */}
        {noticia.imagen && (
          <img
            src={noticia.imagen.startsWith("http") ? noticia.imagen : `${baseUrl}${noticia.imagen}`}
            alt={noticia.titulo}
            className="w-full h-64 object-cover rounded-2xl mb-4"
          />
        )}

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{noticia.titulo}</h1>

        {/* Información de la noticia */}
        <p className="text-sm text-gray-500">
          {noticia.autor} —{" "}
          {new Date(noticia.fecha_publicacion).toLocaleDateString()}
        </p>

        {/* Contenido */}
        <p className="mt-2 text-lg text-gray-700 whitespace-pre-line">{noticia.contenido}</p>

        {/* Botón de volver */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
