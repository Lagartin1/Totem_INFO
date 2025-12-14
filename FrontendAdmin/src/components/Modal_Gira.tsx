import type { Gira } from "../types/index";
import { createPortal } from "react-dom";
import EditorViewer from "./EditorViewer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export interface ModalProyectosProps {
  gira: Gira;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal_Gira({
  gira,
  isOpen,
  onClose,
}: ModalProyectosProps) {
  if (!isOpen) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {gira.titulo}
        </h2>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-semibold">Año:</span>
                <p className="mt-1">{gira.anio}</p>
              </div>
              {gira.descripcion && (
                <div>
                  <span className="font-semibold">Descripción:</span>
                  <div className="mt-1 text-gray-700">
                    <EditorViewer
                      initialData={(gira as any).descripcion_html ? (gira as any).descripcion_html : (gira.descripcion || '')}
                      className="prose mt-1 text-gray-700"
                    />
                  </div>
                </div>
              )}
              {gira.lugares && gira.lugares.length > 0 && (
                <div>
                  <span className="font-semibold">Lugares visitados:</span>
                  <ul className="mt-1 list-disc list-inside">
                    {gira.lugares.map((lugar, index) => (
                      <li key={index}>{lugar}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Portada */}
          {gira.portada && (
            <div>
              <span className="font-semibold text-gray-700">Portada:</span>
              <img
                src={`${baseUrl}${gira.portada}`}
                alt="Portada de la gira"
                className="w-full h-48 rounded-lg object-cover mt-2"
              />
            </div>
          )}
        </div>

        {/* Videos */}
        {Array.isArray(gira.videos) && gira.videos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Videos ({gira.videos.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gira.videos.map((videoUrl, index) => (
                <video
                  key={index}
                  className="w-full h-48 rounded-lg object-cover"
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  preload="metadata">
                  <source src={`${baseUrl}${videoUrl}`} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              ))}
            </div>
          </div>
        )}

        {/* Imágenes */}
        {Array.isArray(gira.imagenes) && gira.imagenes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Imágenes ({gira.imagenes.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gira.imagenes.map((imagenUrl, index) => (
                <img
                  key={index}
                  src={`${baseUrl}${imagenUrl}`}
                  alt={`Imagen ${index + 1} de la gira`}
                  className="w-full h-32 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Opcional: abrir en modal grande para vista detallada
                    window.open(`${baseUrl}${imagenUrl}`, '_blank');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay multimedia */}
        {(!gira.videos || gira.videos.length === 0) && 
         (!gira.imagenes || gira.imagenes.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-12 h-12 mx-auto mb-2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z"
              />
            </svg>
            <p>No hay contenido multimedia disponible</p>
          </div>
        )}

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
