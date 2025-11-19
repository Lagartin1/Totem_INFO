import { useState } from "react";
import Modal_Becados from "./Modal_Becados";
import type { Becado } from "../types/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

function Card_Becados({ becado }: { becado: Becado }) {
  const [open, setOpen] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return (
    <>
      {/* Card */}
      <div className="relative min-w-[350px] max-w-[350px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
        {/* Galería de videos */}
        {Array.isArray(becado.videos) && becado.videos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto mb-4">
            {becado.videos.map((videoUrl, index) => (
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

        <h3 className="font-bold text-lg mb-1">{becado.titulo}</h3>

        <button
          onClick={() => setOpen(true)}
          className="mt-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Ver detalles
        </button>
      </div>
      <Modal_Becados
        becado={becado}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export default Card_Becados;
