import React from "react";
import type { Gira, Becado, Workshop } from "../types/index";
import Loader from "./Loader";
import Card_Main from "./Card_Main";
import NavBar from "./NavBar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

// Union type para todos los tipos de contenido
type ContentItem = Gira | Becado | Workshop;

// Tipo para especificar el tipo de página
export type PageType = 'gira' | 'becado' | 'workshop';

// Configuración específica por tipo de página
interface PageConfig {
  type: PageType;
  title: string;
  description: string;
  apiEndpoint: string;
  loadingMessage: string;
  emptyStateIcon: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
  dataKey: string; // Clave en la respuesta de la API donde están los datos
}

interface PageModelProps {
  type: PageType;
}

export default function Page_Model({ type }: PageModelProps) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingPage, setLoadingPage] = React.useState<boolean>(false);
  const [items, setItems] = React.useState<ContentItem[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Configuración específica según el tipo de página
  const getPageConfig = (pageType: PageType): PageConfig => {
    switch (pageType) {
      case 'gira':
        return {
          type: pageType,
          title: "Giras",
          description: `Las Giras Académicas son experiencias educativas que permiten a los
            estudiantes de Ingeniería Civil en Informática conocer de cerca el
            mundo profesional y empresarial, visitando empresas tecnológicas,
            centros de investigación y organizaciones del sector. Estas
            actividades complementan la formación académica con experiencia
            práctica real, fomentando el networking y la comprensión del mercado
            laboral. Durante las giras, los estudiantes pueden interactuar con
            profesionales del área, conocer procesos productivos y tecnologías
            de vanguardia, ampliando su visión sobre las oportunidades
            profesionales en el campo de la informática.`,
          apiEndpoint: "/api/gira",
          loadingMessage: "Cargando giras...",
          emptyStateIcon: "📍",
          emptyStateTitle: "No hay giras disponibles",
          emptyStateMessage: `Por el momento no hay giras académicas programadas. 
            Vuelve pronto para conocer las próximas experiencias educativas.`,
          dataKey: "giras"
        };
      case 'becado':
        return {
          type: pageType,
          title: "Becados",
          description: `Los Becados de Informática representan el talento académico y el compromiso estudiantil
            de nuestra carrera de Ingeniería Civil en Informática. Estos estudiantes destacados
            han demostrado excelencia académica y dedicación en sus estudios, obteniendo reconocimientos
            y apoyo financiero para continuar su formación profesional.
            A través del programa de becas, promovemos la igualdad de oportunidades y fomentamos
            el desarrollo de futuros profesionales que contribuirán significativamente al campo
            de la tecnología y la innovación en nuestro país.`,
          apiEndpoint: `${baseUrl}/api/becados`,
          loadingMessage: "Cargando becados...",
          emptyStateIcon: "🎓",
          emptyStateTitle: "No hay becados disponibles",
          emptyStateMessage: `Por el momento no hay información de becados disponible. 
            Vuelve pronto para conocer a nuestros estudiantes destacados.`,
          dataKey: "becados"
        };
      case 'workshop':
        return {
          type: pageType,
          title: "Workshops",
          description: `El Workshop de Informática es un ciclo de charlas y presentaciones donde estudiantes
            de Ingeniería Civil en Informática pueden conectar con el mundo profesional,
            compartir conocimientos y explorar las últimas tendencias tecnológicas.
            Organizado por estudiantes de último año, este evento se realiza cada semestre 
            y se ha convertido en un punto de encuentro clave para fortalecer los lazos con el medio.
            Desde su primera edición en 2014, el Workshop ha mantenido su esencia de aprendizaje 
            colaborativo, adaptándose a nuevas temáticas y ofreciendo una experiencia enriquecedora 
            para todos los participantes.`,
          apiEndpoint: "/api/workshops",
          loadingMessage: "Cargando workshops...",
          emptyStateIcon: "💻",
          emptyStateTitle: "No hay workshops disponibles",
          emptyStateMessage: `Por el momento no hay workshops programados. 
            Vuelve pronto para conocer los próximos talleres y charlas.`,
          dataKey: "data"
        };
      default:
        return {
          type: 'gira',
          title: "Contenido",
          description: "Descripción por defecto",
          apiEndpoint: "/api/contenido",
          loadingMessage: "Cargando contenido...",
          emptyStateIcon: "📄",
          emptyStateTitle: "No hay contenido disponible",
          emptyStateMessage: "Por el momento no hay contenido disponible.",
          dataKey: "data"
        };
    }
  };

  const config = getPageConfig(type);

  React.useEffect(() => {
    setLoadingPage(true);
    fetch(`${config.apiEndpoint}?pagina=${page}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Respuesta API:", data);
        
        // Extraer los datos según la configuración
        const itemsData = data[config.dataKey] || data.data || [];
        setItems(itemsData);
        
        // Calcular páginas totales
        const total = data.total || 0;
        setTotalPages(total > 0 ? Math.ceil(total / 6) : 1);
        
        console.log(data);
        setLoadingPage(false);
      })
      .catch((error) => {
        console.error(`Error al obtener ${config.title.toLowerCase()}:`, error);
        setItems([]);
        setTotalPages(1);
        setLoadingPage(false);
      });
  }, [page, config.apiEndpoint, config.dataKey, config.title]);

  const fetchNewPage = (newPage: number) => {
    setLoading(true);
    fetch(`${config.apiEndpoint}?pagina=${newPage}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        const itemsData = data[config.dataKey] || data.data || [];
        setItems(itemsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error(`Error al obtener ${config.title.toLowerCase()}:`, error);
        setItems([]);
        setLoading(false);
      });
  };

  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
      {loading && <Loader frase={config.loadingMessage} />}
      {loadingPage && <Loader frase="Cargando página..." />}
      <NavBar />
      <div className="mt-20 flex flex-row gap-20 justify-center">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-6">
            {items.length > 0 ? (
              items.map((item) => (
                <Card_Main
                  key={item.id}
                  item={item}
                  type={config.type}
                />
              ))
            ) : (
              !loadingPage && (
                <div className="col-span-3 flex flex-col items-center justify-center p-12 text-center">
                  <div className="text-6xl mb-4">{config.emptyStateIcon}</div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                    {config.emptyStateTitle}
                  </h3>
                  <p className="text-gray-500 text-lg">
                    {config.emptyStateMessage}
                  </p>
                </div>
              )
            )}
          </div>
          
          {/* Paginación */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {items.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => fetchNewPage(Math.max(1, page - 1))}
                  className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
                  aria-label="Anterior"
                  disabled={page <= 1}>
                  ‹
                </button>

                {Array.from(
                  { length: Math.max(1, Math.ceil(totalPages || 1)) },
                  (_, i) => {
                    const p = i + 1;
                    const isActive = p === page;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 text-sm rounded focus:outline-none ${
                          isActive
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        aria-label={`Página ${p}`}>
                        {p}
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  onClick={() =>
                    fetchNewPage(
                      Math.min(Math.max(1, Math.ceil(totalPages || 1)), page + 1)
                    )
                  }
                  className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
                  aria-label="Siguiente"
                  disabled={page >= Math.max(1, Math.ceil(totalPages || 1))}>
                  ›
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Panel de información lateral */}
        <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center">
          <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20">
            {config.title}
          </h1>
          <p className="text-white/90 text-lg font-semibold text-center justify-center p-5 mt-5">
            {config.description}
          </p>
        </div>
      </div>
    </main>
  );
}
