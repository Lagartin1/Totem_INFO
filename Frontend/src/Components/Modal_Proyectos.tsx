import type { Proyecto } from "../types/index";
import { createPortal } from "react-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export interface ModalProyectosProps {
  proyecto: Proyecto;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal_Proyectos({
  proyecto,
  isOpen,
  onClose,
}: ModalProyectosProps) {
  if (!isOpen) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // 👈 click fuera cierra
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // 👈 evita que el click dentro cierre
      >
        {/* Galería de videos */}
        {Array.isArray(proyecto.videos) && proyecto.videos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto mb-4">
            {proyecto.videos.map((videoUrl, index) => (
              <video
                key={index}
                className="w-full h-40 rounded-lg flex-shrink-0 object-cover"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                preload="metadata">
                <source src={`${baseUrl}${videoUrl}`} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
            ))}
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
            Sin videos
          </div>
        )}
        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {proyecto.titulo}
        </h2>

        {/* Contenido */}
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Área:</span>{" "}
            {proyecto.area_desarrollo}
          </p>
          <p>
            <span className="font-semibold">Profesores:</span>{" "}
            {proyecto.autores}
          </p>
          <p>
            <span className="font-semibold">Contacto:</span>{" "}
            {proyecto.correo_contacto} | {proyecto.telefono_contacto}
          </p>
          <span className="font-semibold">Descripción:</span>
          {proyecto.descripcion && <p>{proyecto.descripcion}</p>}
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
