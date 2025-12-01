import React from "react";
import type { Becado } from "../types/index";
import Carousel from "./Carousel";
import VideoYoutube from "./VideoYoutube";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardBecadosProps {
  becado: Becado;
}

export default function Card_Becados({ becado }: CardBecadosProps) {
  const [modal, setModal] = React.useState<boolean>(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Verificación de seguridad: si no hay becado, no renderizar nada
  if (!becado) {
    console.error("Card_Becados: becado es undefined");
    return null;
  }

  // Construir URL de la imagen de portada
  const getImageUrl = () => {
    if (!becado.portada) return null;
    if (becado.portada.startsWith("http")) {
      return becado.portada;
    }
    return `${baseUrl}${becado.portada}`;
  };

  // Extraer ID de YouTube de una URL
  const extractYouTubeId = (url: string): string | null => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
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
    if (becado.videos && becado.videos.length > 0) {
      becado.videos.forEach((video, index) => {
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
    if (becado.imagenes && becado.imagenes.length > 0) {
      becado.imagenes.forEach((imagen, index) => {
        slides.push(
          <div
            key={`imagen-${index}`}
            className="w-full h-full flex items-center justify-center">
            <img
              src={getImageUrlComplete(imagen)}
              alt={`Imagen ${index + 1} de ${becado.titulo}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
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
            !imageUrl ? "bg-gradient-to-br from-green-400 to-blue-600" : ""
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
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443a55.381 55.381 0 0 1 5.25 2.882V15a.75.75 0 1 0 1.5 0v-3.675a55.378 55.378 0 0 1 5.25 2.882V15a.75.75 0 1 0 1.5 0v-3.675A55.381 55.381 0 0 1 12 8.443a55.378 55.378 0 0 1-5.25 2.882V15a.75.75 0 1 0-1.5 0Z"
                />
              </svg>
              <p className="text-lg font-medium">Beca Académica</p>
            </div>
          </div>
        )}

        {/* Badge con contador de multimedia */}
        {((becado.videos?.length || 0) > 0 || (becado.imagenes?.length || 0) > 0) && (
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
              {(becado.videos?.length || 0) + (becado.imagenes?.length || 0)}
            </span>
          </div>
        )}
        
        {/* Contenido del título */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
            {becado.titulo}
          </h1>
          {becado.descripcion && (
            <p className="text-white/90 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {becado.descripcion.substring(0, 100)}
              {becado.descripcion.length > 100 && "..."}
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
            <div className="flex flex-col w-[35%] h-full p-8 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="bg-white rounded-full px-4 py-2 shadow-md mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5 text-green-600">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443a55.381 55.381 0 0 1 5.25 2.882V15a.75.75 0 1 0 1.5 0v-3.675a55.378 55.378 0 0 1 5.25 2.882V15a.75.75 0 1 0 1.5 0v-3.675A55.381 55.381 0 0 1 12 8.443a55.378 55.378 0 0 1-5.25 2.882V15a.75.75 0 1 0-1.5 0Z"
                    />
                  </svg>
                  <span className="font-semibold text-green-600 text-lg">
                    Becado
                  </span>
                </div>
                <h1 className="font-bold text-3xl text-gray-800 leading-tight">
                  {becado.titulo}
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
                    {becado.descripcion || "No hay descripción disponible."}
                  </p>
                </div>

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
                      {becado.videos?.length || 0} Video{(becado.videos?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      {becado.imagenes?.length || 0} Imagen{(becado.imagenes?.length || 0) !== 1 ? 'es' : ''}
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
                      <p className="text-gray-400">Este becado aún no tiene videos o imágenes disponibles</p>
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
