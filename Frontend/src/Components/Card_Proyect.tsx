import { useState } from "react";
import ModalProyecto from "./Modal_proyectos";
import type { Proyecto } from "../types/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface ProyectoProps {
  proyecto: Proyecto;
}

export default function Card_Proyectos({ proyecto }: ProyectoProps) {
  const [open, setOpen] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return (
    <>
      {/* Card */}
      <div className="relative min-w-[350px] max-w-[350px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
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

        <h3 className="font-bold text-lg mb-1">{proyecto.titulo}</h3>
        <p className="text-gray-600 text-sm">{proyecto.autores}</p>
        <p className="text-gray-500 text-sm mb-4">{proyecto.area_desarrollo}</p>
        <p className="text-gray-500 text-sm mb-4">
          {proyecto.correo_contacto} | {proyecto.telefono_contacto}
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Ver detalles
        </button>
      </div>
      <ModalProyecto
        proyecto={proyecto}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
