import React from "react";
import Loader from "../Components/Loader";
import Card_Main from "../Components/Card_Main";
import NavBar from "../Components/NavBar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Becados() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingPage, setLoadingPage] = React.useState<boolean>(false);
  const [becados, setBecados] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  React.useEffect(() => {
    setLoadingPage(true);
    fetch(`${baseUrl}/api/becados?pagina=${page}`)  // Usar la URL completa del backend
      .then(response => response.json())
      .then(data => {
        setBecados(data.becados || data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / 6)); // Asumiendo un pageSize de 6
        console.log(data);
        setLoadingPage(false);
      })
      .catch(error => {
        console.error('Error al obtener los becados:', error);
        setLoadingPage(false);
      });
  }, [page]);

  const fetchNewPage = (newPage: number) => {
    setLoading(true);
    fetch(`${baseUrl}/api/becados?pagina=${newPage}`)  // Usar la URL completa del backend
      .then(response => response.json())
      .then(data => {
        setBecados(data.becados || data.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener los becados:', error);
        setLoading(false);
      });
  }

  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
      {loading && <Loader frase="Cargando becados..." />}
      {loadingPage && <Loader frase="Cargando página..." />}
      <NavBar />
      <div className="mt-20 flex flex-row gap-20 justify-center">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-10">
            {becados.map((becado) => ( 
              <Card_Main 
                key={becado.id}
                item={becado}
                type="becado"
              />
            ))}
          </div>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <button
              type="button"
              onClick={() => fetchNewPage(Math.max(1, page - 1))}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
              aria-label="Anterior"
              disabled={page <= 1}
            >
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
                aria-label={`Página ${p}`}
                >
                {p}
                </button>
              );
              }
            )}

            <button
              type="button"
              onClick={() => fetchNewPage(Math.min(Math.max(1, Math.ceil(totalPages || 1)), page + 1))}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
              aria-label="Siguiente"
              disabled={page >= Math.max(1, Math.ceil(totalPages || 1))}
            >
              ›
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center" >
          <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20 ">Becados</h1>
          <p className="text-white/90 text-lg font-semibold text-center justify-center p-5 mt-5">
          Los Becados de Informática representan el talento académico y el compromiso estudiantil
          de nuestra carrera de Ingeniería Civil en Informática. Estos estudiantes destacados
          han demostrado excelencia académica y dedicación en sus estudios, obteniendo reconocimientos
          y apoyo financiero para continuar su formación profesional.
          A través del programa de becas, promovemos la igualdad de oportunidades y fomentamos
          el desarrollo de futuros profesionales que contribuirán significativamente al campo
          de la tecnología y la innovación en nuestro país.
          </p>
        </div>
      </div>  
    </main>
  );
}
