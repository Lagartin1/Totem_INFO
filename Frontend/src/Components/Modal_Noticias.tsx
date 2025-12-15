import { createPortal } from "react-dom";
import type { Noticia } from "../types/index";
import EditorViewer from "./EditorViewer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface NoticiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticia: Noticia | null;
}

export default function Modal_Noticias({
  isOpen,
  onClose,
  noticia,
}: NoticiaModalProps) {
  if (!isOpen || !noticia) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}>
        {/* Imagen de la noticia */}
        {noticia.imagen && (
          <img
            src={
              noticia.imagen.startsWith("http")
                ? noticia.imagen
                : `${baseUrl}${noticia.imagen}`
            }
            alt={noticia.titulo}
            className="w-full h-64 object-cover rounded-2xl mb-4"
          />
        )}
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {noticia.titulo}
        </h1>

        {/* Información de la noticia */}
        <p className="text-sm text-gray-500">
          {noticia.autor} —{" "}
          {new Date(noticia.fecha_publicacion).toLocaleDateString()}
        </p>

        {/* Contenido (renderizado como EditorJS en modo sólo lectura) */}
        <div className="mt-2 text-lg text-gray-700 overflow-y-auto max-h-[60vh] pr-4">
          <EditorViewer initialData={noticia.contenido || ''} />
        </div>

        {/* Botón de volver */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            Volver
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
