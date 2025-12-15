import React from "react";
import type { Gira, Becado, Workshop, Proyecto } from "../types/index";
import Carousel from "./Carousel";
import VideoYoutube from "./VideoYoutube";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

// Tipos de contenido soportados
export type CardType = "gira" | "becado" | "workshop" | "proyecto";

// Union type para todos los tipos de contenido
type ContentItem = Gira | Becado | Workshop | Proyecto;

// Configuraciones específicas por tipo
interface CardConfig {
  type: CardType;
  icon: React.ReactNode;
  defaultGradient: string;
  badgeColor: string;
  modalGradient: string;
  emptyStateText: string;
  badgeText: string;
}

interface CardMainProps {
  item: ContentItem;
  type: CardType;
}

export default function Card_Main({ item, type }: CardMainProps) {
  const [modal, setModal] = React.useState<boolean>(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Configuración específica según el tipo
  const getCardConfig = (cardType: CardType): CardConfig => {
    switch (cardType) {
      case "gira":
        return {
          type: cardType,
          icon: (
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
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
          ),
          defaultGradient: "bg-gradient-to-br from-blue-400 to-purple-600",
          badgeColor: "text-blue-600",
          modalGradient: "bg-gradient-to-br from-blue-50 to-purple-50",
          emptyStateText: "Gira Técnica",
          badgeText: "Gira",
        };
      case "becado":
        return {
          type: cardType,
          icon: (
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
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443a55.381 55.381 0 0 1 5.25 2.882V15a.75.75 0 1 0 1.5 0v-3.675a55.378 55.378 0 0 1 5.25 2.882V15a.75.75 0 1 0 1.5 0v-3.675A55.381 55.381 0 0 1 12 8.443a55.378 55.378 0 0 1-5.25 2.882V15a.75.75 0 1 0-1.5 0Z"
              />
            </svg>
          ),
          defaultGradient: "bg-gradient-to-br from-green-400 to-blue-600",
          badgeColor: "text-green-600",
          modalGradient: "bg-gradient-to-br from-green-50 to-blue-50",
          emptyStateText: "Beca Académica",
          badgeText: "Becado",
        };
      case "workshop":
        return {
          type: cardType,
          icon: (
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
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
          ),
          defaultGradient: "bg-gradient-to-br from-orange-400 to-red-600",
          badgeColor: "text-orange-600",
          modalGradient: "bg-gradient-to-br from-orange-50 to-red-50",
          emptyStateText: "Workshop",
          badgeText: "Taller",
        };
      case "proyecto":
        return {
          type: cardType,
          icon: (
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
                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-2.25 2.25H3.104c-.684 0-1.104-.576-1.104-1.104V3.104c0-.528.42-1.104 1.104-1.104h5.714c.684 0 1.104.576 1.104 1.104Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 3.104v5.714a2.25 2.25 0 0 1-2.25 2.25h-5.714a2.25 2.25 0 0 1-2.25-2.25V3.104m0 0a2.25 2.25 0 0 1 2.25-2.25h5.714c1.24 0 2.25 1.01 2.25 2.25m0 0v5.714c0 1.24-1.01 2.25-2.25 2.25h-5.714m0 0a2.25 2.25 0 0 1-2.25-2.25v-5.714m0 0a2.25 2.25 0 0 1 2.25-2.25h5.714a2.25 2.25 0 0 1 2.25 2.25M3.75 15.75h16.5"
              />
            </svg>
          ),
          defaultGradient: "bg-gradient-to-br from-indigo-400 to-pink-600",
          badgeColor: "text-indigo-600",
          modalGradient: "bg-gradient-to-br from-indigo-50 to-pink-50",
          emptyStateText: "Proyecto",
          badgeText: "Proyecto",
        };
      default:
        return {
          type: "gira",
          icon: <></>,
          defaultGradient: "bg-gradient-to-br from-gray-400 to-gray-600",
          badgeColor: "text-gray-600",
          modalGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
          emptyStateText: "Contenido",
          badgeText: "Item",
        };
    }
  };

  const config = getCardConfig(type);

  // Verificar si el item tiene portada (incluye thumbnails de YouTube para workshops)
  const getImageUrl = () => {
    if (type === "workshop") {
      // Para workshops, usar thumbnail de YouTube si está disponible
      return thumbnailUrl || null;
    }

    const itemWithPortada = item as Gira | Becado;
    if (!itemWithPortada.portada) return null;

    if (itemWithPortada.portada.startsWith("http")) {
      return itemWithPortada.portada;
    }
    return `${baseUrl}${itemWithPortada.portada}`;
  };

  // Obtener videos según el tipo
  const getVideos = () => {
    if (type === "workshop") {
      const workshop = item as Workshop;
      return workshop.link ? [workshop.link] : [];
    }

    const itemWithVideos = item as Gira | Becado;
    return itemWithVideos.videos || [];
  };

  // Obtener imágenes (solo Gira y Becado)
  const getImages = () => {
    if (type === "workshop") return [];

    const itemWithImages = item as Gira | Becado;
    return itemWithImages.imagenes || [];
  };

  // Obtener información específica del item según su tipo
  const getItemInfo = () => {
    switch (type) {
      case "gira":
        const gira = item as Gira;
        return {
          titulo: gira.titulo,
          descripcion: gira.descripcion,
          badgeText: gira.anio ? `Año ${gira.anio}` : config.badgeText,
          extraInfo:
            gira.lugares && gira.lugares.length > 0 ? gira.lugares : null,
        };
      case "becado":
        const becado = item as Becado;
        return {
          titulo: becado.titulo,
          descripcion: becado.descripcion,
          badgeText: becado.nombre || config.badgeText,
          extraInfo: null,
        };
      case "workshop":
        const workshop = item as Workshop;
        return {
          titulo: workshop.titulo,
          descripcion: workshop.descripcion,
          badgeText: new Date(workshop.fecha).getFullYear().toString(),
          extraInfo: null,
        };
      case "proyecto":
        const proyecto = item as Proyecto;
        return {
          titulo: proyecto.titulo,
          descripcion: proyecto.descripcion,
          badgeText: proyecto.area_desarrollo || config.badgeText,
          extraInfo: null,
        };
      default:
        return {
          titulo: "Sin título",
          descripcion: "Sin descripción",
          badgeText: config.badgeText,
          extraInfo: null,
        };
    }
  };

  const itemInfo = getItemInfo();

  // Extraer ID de YouTube de una URL con función más robusta
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== "string") {
      console.error("URL no válida");
      return null;
    }

    // Limpiar la URL
    const cleanUrl = url.trim();

    // Definir todos los patrones posibles
    const regexPatterns = [
      // https://www.youtube.com/watch?v=VIDEO_ID
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:[&\\?].*)?$/,

      // https://youtu.be/VIDEO_ID
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,

      // https://www.youtube.com/embed/VIDEO_ID
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,

      // https://www.youtube.com/v/VIDEO_ID
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,

      // https://www.youtube.com/shorts/VIDEO_ID
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,

      // https://www.youtube.com/live/VIDEO_ID
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,

      // https://www.youtube.com/live/VIDEO_ID?si=...
      /youtube\.com\/live\/([a-zA-Z0-9_-]+)(?:\?.*)?/,

      // Solo el ID (11 caracteres)
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of regexPatterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        // Validar que el ID tenga exactamente 11 caracteres
        const videoId = match[1];
        if (videoId.length === 11) {
          return videoId;
        }
      }
    }

    console.warn("No se pudo extraer el ID de YouTube de la URL:", url);
    return null;
  };

  // Construir URL completa para imágenes
  const getImageUrlComplete = (imagePath: string): string => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${baseUrl}${imagePath}`;
  };

  // Try several YouTube thumbnail keys and pick the first that loads
  const thumbKeys = [
    "maxresdefault",
    "sddefault",
    "hqdefault",
    "mqdefault",
    "default",
  ];

  const probeThumbnail = (videoId: string | null) => {
    return new Promise<string>((resolve) => {
      if (!videoId) {
        resolve("");
        return;
      }

      const MIN_WIDTH = 200; // reject tiny placeholder thumbs
      const MIN_HEIGHT = 120;
      let tried = 0;

      const tryKey = () => {
        if (tried >= thumbKeys.length) {
          resolve("");
          return;
        }
        const key = thumbKeys[tried];
        const url = `https://img.youtube.com/vi/${videoId}/${key}.jpg`;
        const img = new Image();

        // If neither onload nor onerror fire (rare), use a timeout to continue
        let timeoutId: number | undefined = undefined;
        const clear = () => {
          if (timeoutId) window.clearTimeout(timeoutId);
        };

        img.onload = () => {
          clear();
          // Reject very small images (YouTube sometimes serves small placeholders)
          if (
            (img.naturalWidth || 0) >= MIN_WIDTH &&
            (img.naturalHeight || 0) >= MIN_HEIGHT
          ) {
            resolve(url);
          } else {
            tried++;
            tryKey();
          }
        };
        img.onerror = () => {
          clear();
          tried++;
          tryKey();
        };

        // 2s timeout per attempt
        timeoutId = window.setTimeout(() => {
          // treat as failure and continue
          tried++;
          tryKey();
        }, 2000);

        img.src = url;
      };

      tryKey();
    });
  };

  const imageUrl = getImageUrl();
  const videos = getVideos();
  const images = getImages();

  // Crear slides combinando videos e imágenes
  const createMediaSlides = () => {
    const slides: React.ReactNode[] = [];

    // Agregar videos
    if (videos && videos.length > 0) {
      videos.forEach((video, index) => {
        const videoId = extractYouTubeVideoId(video);

        if (videoId) {
          slides.push(
            <div
              key={`video-${index}`}
              className="w-full h-full p-4 flex flex-col">
              <div className="flex-1">
                <VideoYoutube
                  videoId={videoId}
                  className="w-full h-full rounded-lg"
                  setLoading={type === "workshop" ? setLoading : undefined}
                />
              </div>
            </div>
          );
        } else {
          // Si no se puede extraer el ID, mostrar enlace directo
          slides.push(
            <div key={`${index}`} className="w-full h-full p-4 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <video
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  loop
                  className="max-w-full max-h-full rounded-lg object-contain cursor-pointer"
                  data-interactive
                  onClick={(e) => {
                    const target = e.target as HTMLVideoElement;
                    if (target.paused) {
                      target.play();
                    } else {
                      target.pause();
                    }
                  }}
                  onTouchStart={(e) => {
                    const target = e.target as HTMLVideoElement;
                    if (target.paused) {
                      target.play();
                    } else {
                      target.pause();
                    }
                  }}>
                  <source src={`${baseUrl}${video}`} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>
            </div>
          );
        }
      });
    }

    // Agregar imágenes
    if (images && images.length > 0) {
      images.forEach((imagen, index) => {
        slides.push(
          <div
            key={`imagen-${index}`}
            className="w-full h-full p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <img
                src={getImageUrlComplete(imagen)}
                alt={`Imagen ${index + 1} de ${itemInfo.titulo}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </div>
        );
      });
    }

    return slides;
  };

  const mediaSlides = createMediaSlides();

  // Efecto para cargar thumbnail de YouTube para workshops
  React.useEffect(() => {
    if (type === "workshop") {
      const workshop = item as Workshop;
      const videoId = extractYouTubeVideoId(workshop.link);
      // start with empty while probing
      setThumbnailUrl("");
      probeThumbnail(videoId).then((url) => {
        if (url) setThumbnailUrl(url);
      });
    }
  }, [item, type]);

  const performClick = () => {
    if (type === "workshop") {
      setLoading(true);
    }
    setModal(true);
  };

  return (
    <>
      <div
        role="button"
        onClick={performClick}
        className={`rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ease-out 
          transition-colors ease-out duration-300 h-90 w-80 flex flex-col justify-end 
          items-center cursor-pointer relative overflow-hidden`}
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { backgroundColor: "#f3f4f6" }
        }>
        {/* Overlay para mejor legibilidad del texto */}
        <div className="absolute bg-gradient-to-t from-black/50 to-transparent text-lg font-semibold inset-0 z-10 overflow-hidden rounded-lg">
          <h1 className="absolute bottom-10 left-5 w-60 text-xl font-bold text-white">
            {itemInfo.titulo}
          </h1>
        </div>

        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-5">
            <div className="text-gray-600 text-center">
              {config.icon}
              <p className="text-sm font-medium mt-2">
                {config.emptyStateText}
              </p>
            </div>
          </div>
        )}
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
            <div
              className={`flex flex-col w-[35%] h-full p-8 ${config.modalGradient}`}>
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="bg-white rounded-full px-4 py-2 shadow-md mb-4 flex items-center gap-2">

                  <span
                    className={`font-semibold ${config.badgeColor} text-lg`}>
                    {itemInfo.badgeText}
                  </span>
                </div>
                <h1 className="font-bold text-3xl text-gray-800 leading-tight">
                  {itemInfo.titulo}
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
                    {itemInfo.descripcion || "No hay descripción disponible."}
                  </p>
                </div>

                {/* Información adicional específica por tipo */}
                {type === "gira" &&
                  itemInfo.extraInfo &&
                  Array.isArray(itemInfo.extraInfo) && (
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
                        {itemInfo.extraInfo.map((lugar, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {lugar}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Información adicional para workshops */}
                {type === "workshop" && (
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
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5"
                        />
                      </svg>
                      Fecha del Workshop
                    </h3>
                    <p className="text-gray-600">
                      {new Date((item as Workshop).fecha).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}
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
                    <Carousel
                      slides={mediaSlides}
                      autoPlay={mediaSlides.length > 3}
                      autoPlayInterval={6000}
                      showThumbnails={mediaSlides.length <= 6}
                    />
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
                      <p className="text-xl font-medium mb-2">
                        No hay contenido multimedia
                      </p>
                      <p className="text-gray-400">
                        {type === "workshop"
                          ? "Este workshop aún no tiene un video disponible"
                          : `Este ${config.emptyStateText.toLowerCase()} aún no tiene videos o imágenes disponibles`}
                      </p>
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
