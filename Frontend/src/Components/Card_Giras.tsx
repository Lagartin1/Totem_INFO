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
        className={`rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 
          transition-all duration-300 ease-out h-96 w-80 flex flex-col justify-end 
          items-center cursor-pointer relative overflow-hidden group ${
            !imageUrl ? "bg-gradient-to-br from-blue-400 to-purple-600" : ""
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
        
        {/* Overlay para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" />
        
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-16 h-16 mx-auto mb-3">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
              <p className="text-lg font-medium">Gira Técnica</p>
            </div>
          </div>
        )}

        {/* Badge con el año */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full z-20">
          <span className="text-sm font-semibold text-gray-800">{gira.anio}</span>
        </div>

        {/* Badge con contador de multimedia */}
        {((gira.videos?.length || 0) > 0 || (gira.imagenes?.length || 0) > 0) && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full z-20 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 text-white">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 4.5 5.25H12a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25Z"
              />
            </svg>
            <span className="text-xs font-medium text-white">
              {(gira.videos?.length || 0) + (gira.imagenes?.length || 0)}
            </span>
          </div>
        )}
        
        {/* Contenido del título */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
            {gira.titulo}
          </h1>
          {gira.descripcion && (
            <p className="text-white/90 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {gira.descripcion.substring(0, 100)}
              {gira.descripcion.length > 100 && "..."}
            </p>
          )}
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="flex h-[90vh] w-[95vw] max-w-7xl bg-white rounded-2xl shadow-2xl flex-row items-center relative overflow-hidden">
            
            {/* Botón de cerrar */}
            <button
              className="absolute top-6 right-6 text-gray-600 hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-full w-12 h-12 
                        flex items-center justify-center hover:bg-red-50 transition-all duration-200 z-30 shadow-lg"
              onClick={() => setModal(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-6 w-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Sección de información */}
            <div className="flex flex-col w-[35%] h-full p-8 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="bg-white rounded-full px-4 py-2 shadow-md mb-4">
                  <span className="font-semibold text-blue-600 text-lg">
                    Año {gira.anio}
                  </span>
                </div>
                <h1 className="font-bold text-3xl text-gray-800 leading-tight">
                  {gira.titulo}
                </h1>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0-1.125-.504-1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                    Descripción
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {gira.descripcion || "No hay descripción disponible."}
                  </p>
                </div>

                {gira.lugares && gira.lugares.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      Lugares Visitados
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {gira.lugares.map((lugar, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {lugar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estadísticas de multimedia */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 4.5 5.25H12a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25Z"
                      />
                    </svg>
                    Contenido Multimedia
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      {gira.videos?.length || 0} Video{(gira.videos?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      {gira.imagenes?.length || 0} Imagen{(gira.imagenes?.length || 0) !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección de multimedia */}
            <div className="flex flex-col w-[65%] h-full bg-gray-50">
              <div className="p-6 bg-white border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                  Galería Multimedia
                </h2>
              </div>
              
              <div className="flex-1 p-6">
                {mediaSlides.length > 0 ? (
                  <div className="h-full bg-white rounded-xl shadow-inner overflow-hidden">
                    <Carousel slides={mediaSlides} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-inner">
                    <div className="text-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1"
                        stroke="currentColor"
                        className="w-20 h-20 mx-auto mb-4 text-gray-300">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 4.5 5.25H12a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25Z"
                        />
                      </svg>
                      <p className="text-xl font-medium mb-2">No hay contenido multimedia</p>
                      <p className="text-gray-400">Esta gira aún no tiene videos o imágenes disponibles</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
