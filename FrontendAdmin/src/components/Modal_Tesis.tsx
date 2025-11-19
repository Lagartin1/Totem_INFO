import { createPortal } from "react-dom";
import type { Tesis } from "../types/index";

export interface ModalTesisProps {
  tesis: Tesis;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal_Tesis({
  tesis,
  isOpen,
  onClose,
}: ModalTesisProps) {
  if (!isOpen) return null;

  const formatAutores = (autores: string | string[] | undefined) => {
    if (!autores) return "No especificado";
    if (Array.isArray(autores)) {
      return autores.join(", ");
    }
    return autores;
  };

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "No especificada";
    return new Date(fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}>
        {/* Placeholder visual donde estaban los videos */}
        <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5a3.375 3.375 0 0 0-3.375 3.375v2.625m5.25 0v-4.875c0-.621-.504-1.125-1.125-1.125H9.75c-.621 0-1.125.504-1.125 1.125v4.875m0 0a3.375 3.375 0 0 0 3.375 3.375h1.5a3.375 3.375 0 0 0 3.375-3.375Z"
            />
          </svg>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {tesis.title || tesis.titulo}
        </h2>

        {/* Contenido */}
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Autor(es):</span>{" "}
            {formatAutores(tesis.autor)}
          </p>
          <p>
            <span className="font-semibold">Profesor Guía:</span>{" "}
            {tesis.profesor || "No especificado"}
          </p>
          <p>
            <span className="font-semibold">Área:</span>{" "}
            {tesis.area_desarrollo || "No especificada"}
          </p>
          <p>
            <span className="font-semibold">Institución:</span>{" "}
            {tesis.universidad || "No especificada"}
          </p>
          <p>
            <span className="font-semibold">Fecha de publicación:</span>{" "}
            {formatFecha(tesis.fecha_publicacion || tesis.created_at)}
          </p>
          <div>
            <span className="font-semibold">Resumen:</span>
            <p className="mt-1 text-sm text-gray-600">
              {tesis.resumen ||
                tesis.descripcion ||
                "No hay resumen disponible."}
            </p>
          </div>
          {tesis.palabras_clave && (
            <div>
              <span className="font-semibold">Palabras Clave:</span>
              <p className="mt-1 text-sm italic text-gray-500">
                {tesis.palabras_clave}
              </p>
            </div>
          )}
        </div>

        {/* Botón */}
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
