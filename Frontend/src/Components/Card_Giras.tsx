import React from "react";
import type { Gira } from "../types/index";
import Carousel from "./Carousel";
import VideoYoutube from "./VideoYoutube";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardGirasProps {
  gira: Gira;
}

export default function Card_Giras({ gira }: CardGirasProps) {
  const [modal, setModal] = React.useState<boolean>(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Construir URL de la imagen de portada
  const getImageUrl = () => {
    if (!gira.portada) return null;
    if (gira.portada.startsWith("http")) {
      return gira.portada;
    }
    return `${baseUrl}${gira.portada}`;
  };

  // Extraer ID de YouTube de una URL
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Construir URL completa para imágenes
  const getImageUrlComplete = (imagePath: string): string => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${baseUrl}${imagePath}`;
  };

  const imageUrl = getImageUrl();

  // Crear slides combinando videos e imágenes
  const createMediaSlides = () => {
    const slides: React.ReactNode[] = [];
    
    // Agregar videos
    if (gira.videos && gira.videos.length > 0) {
      gira.videos.forEach((video, index) => {
        const videoId = extractYouTubeId(video);
        if (videoId) {
          slides.push(
            <div key={`video-${index}`} className="w-full h-full">
              <VideoYoutube 
                videoId={videoId} 
                className="w-full h-full rounded-lg"
              />
            </div>
          );
        }
      });
    }

    // Agregar imágenes
    if (gira.imagenes && gira.imagenes.length > 0) {
      gira.imagenes.forEach((imagen, index) => {
        slides.push(
          <div key={`imagen-${index}`} className="w-full h-full flex items-center justify-center">
            <img
              src={getImageUrlComplete(imagen)}
              alt={`Imagen ${index + 1} de ${gira.titulo}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        );
      });
    }

    return slides;
  };

  const mediaSlides = createMediaSlides();

  const performClick = () => {
    setModal(true);
  };

  return (
    <>
      <div
        role="button"
        onClick={performClick}
        className={`rounded-lg p-4 shadow-md 
          hover:shadow-lg transition-shadow-ease-out transition-colors-ease-out duration-300
          h-90 w-80 flex flex-col justify-end items-center cursor-pointer relative ${
            !imageUrl ? "bg-gray-300" : ""
          }`}
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }>
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-600 text-center">
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
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}
        <div className="absolute bg-gradient-to-t from-black/50 to-transparent text-lg font-semibold inset-0 z-10 overflow-hidden rounded-lg ">
          <h1 className="absolute bottom-10 left-5 w-60 text-xl font-bold text-white ">
            {gira.titulo}
          </h1>
        </div>
      </div>
      {modal && (
        <div>
          <div
            className="fixed inset-0 bg-black/5 w-full h-full top-1/2 left-1/2 
                                transform -translate-x-1/2 -translate-y-1/2 transition 
                                ease-out inset backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex h-[80vh] w-[95vw] bg-slate-400 rounded-xl flex-row items-center relative">
              {/* Sección de información */}
              <div className="flex flex-col w-[30%] h-full p-5">
                <div className="flex flex-col items-center justify-center text-center mb-4">
                  <h1 className="font-bold text-4xl">{gira.titulo}</h1>
                  <p className="mt-2 italic text-xl">
                    Año: {gira.anio}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-lg text-center">
                    {gira.descripcion}
                  </p>
                  {gira.lugares && gira.lugares.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg mb-2">Lugares visitados:</h3>
                      <ul className="list-disc list-inside text-sm">
                        {gira.lugares.map((lugar, index) => (
                          <li key={index}>{lugar}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sección de videos e imágenes */}
              <div className="flex flex-col w-[70%] h-full p-5">
                <h2 className="text-2xl font-bold mb-4 text-center">Multimedia de la Gira</h2>
                <div className="flex-1">
                  {mediaSlides.length > 0 ? (
                    <Carousel slides={mediaSlides} />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-300 rounded-lg">
                      <div className="text-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-16 h-16 mx-auto mb-2">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 4.5 5.25H12a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25Z"
                          />
                        </svg>
                        <p className="text-lg">No hay contenido multimedia disponible</p>
                      </div>
                    </div>
                  )}
                </div>
                {mediaSlides.length > 0 && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-700">
                      {gira.videos?.length || 0} video{(gira.videos?.length || 0) !== 1 ? 's' : ''} • {gira.imagenes?.length || 0} imagen{(gira.imagenes?.length || 0) !== 1 ? 'es' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              className="absolute top-10 left-20 text-white bg-red-500 rounded-full w-50 h-10 
                            flex items-center justify-center hover:bg-red-600 p-2 gap-2"
              onClick={() => setModal(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
              <span className="text-xl"> Volver </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
