import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardPracticas from "../Components/CardPracticas";
import Header from "../Components/Header";
import Search_Bar from "../Components/Search_Bar";
import Nav_button from "../Components/nav_button";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardPracticasProps {
  id: string;
  labores: string;
  sede_practica: string;
  nombre_contacto: string;
  telefono_contacto: string;
  cargo_contacto: string;
  email_contacto: string;
  regimen_trabajo: string;
  requisitos_especiales: string;
  modalidad: string;
  beneficios: string;
  nombre_empresa: string;
  total: number;
}

interface PracticasData {
  practicas: CardPracticasProps[];
  total: number;
}

export default function PracticasProfesionales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paginaActual = Number(searchParams.get("pagina") ?? 1);

  const [data, setData] = useState<PracticasData>({ practicas: [], total: 0 });
  const [sData, setSData] = useState<PracticasData>({ practicas: [], total: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const n_pages = Math.max(1, Math.ceil(data.total / 10));

  const baseUrl = BUILD_MODE ? API_BASE_URL : 'http://localhost:3000';

  // 🔹 Cargar lista general
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/practicas/profesional?pagina=${paginaActual}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [paginaActual]);

  const setPagina = (newPagina: number) => {
    const bounded = Math.min(Math.max(newPagina, 1), n_pages);
    setSearchParams({ pagina: String(bounded) });
  };

  // 🔹 Búsqueda
  const handleSearch = (searchTerm: string) => {
    setHasSearched(true);
    setLoading(true);
    fetch(
      `${baseUrl}/api/practicas/getSearch/profesional?q=${encodeURIComponent(
        searchTerm
      )}`
    )
      .then((res) => res.json())
      .then((json) => setSData(json))
      .finally(() => setLoading(false));
  };

  const handlevolver = () => {
    setSData({ practicas: [], total: 0 });
    setHasSearched(false);
  };

  return (
    <main className="min-h-screen p-6">
      <Header />
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/practicas" />
      </div>

      <div className="py-10 flex flex-col items-center text-justify m-10 gap-6">
        <Search_Bar onSearch={handleSearch} />

        {/* 🔹 Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando...</p>
          </div>
        )}

        {/* Mostrar título si hay resultados de búsqueda */}
        {!loading && sData.practicas?.length > 0 && (
          <div className="text-2xl font-bold text-gray-700 mb-4">
            Resultados de la búsqueda:
          </div>
        )}

        {/* Mostrar mensaje si ya se buscó algo y no hubo resultados */}
        {!loading &&
          hasSearched &&
          sData.practicas?.length === 0 &&
          sData.total === 0 && (
            <>
              <div className="text-xl font-semibold text-red-600 my-6">
                No se encontraron resultados
              </div>
              <div className="flex flex-col mt-30 bg-gray-800/20 items-center rounded-3xl">
                <div
                  className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
                  onClick={handlevolver}
                >
                  <h3 className="text-balance text-2xl p-5 text-white">
                    Volver a la lista
                  </h3>
                </div>
              </div>
            </>
          )}

        {/* Mostrar resultados de búsqueda */}
        {!loading && sData.practicas?.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-20 md:grid-cols-1 lg:grid-cols-3">
              {sData.practicas.map((practica: CardPracticasProps) => (
                <CardPracticas
                  key={practica.id}
                  id={practica.id}
                  Titulo={practica.labores}
                  lugar={practica.sede_practica}
                  nombre_contacto={practica.nombre_contacto}
                  telefono_contacto={practica.telefono_contacto}
                  cargo_contacto={practica.cargo_contacto}
                  email_contacto={practica.email_contacto}
                  regimen_trabajo={practica.regimen_trabajo}
                  requisitos={practica.requisitos_especiales}
                  modalidad={practica.modalidad}
                  beneficios={practica.beneficios}
                  nombre_empresa={practica.nombre_empresa}
                />
              ))}
            </div>
            <div className="flex flex-col mt-30 bg-gray-800/20 items-center rounded-3xl">
              <div
                className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
                onClick={handlevolver}
              >
                <h3 className="text-balance text-2xl p-5 text-white">
                  Volver a la lista
                </h3>
              </div>
            </div>
          </>
        ) : null}

        {/* Mostrar lista general cuando no hay búsqueda activa */}
        {!loading && (
          <div className="grid grid-cols-3 gap-20 md:grid-cols-1 lg:grid-cols-3">
            {!hasSearched &&
              data.practicas?.map((practica: CardPracticasProps) => (
                <CardPracticas
                  key={practica.id}
                  id={practica.id}
                  Titulo={practica.labores}
                  lugar={practica.sede_practica}
                  nombre_contacto={practica.nombre_contacto}
                  telefono_contacto={practica.telefono_contacto}
                  cargo_contacto={practica.cargo_contacto}
                  email_contacto={practica.email_contacto}
                  regimen_trabajo={practica.regimen_trabajo}
                  requisitos={practica.requisitos_especiales}
                  modalidad={practica.modalidad}
                  beneficios={practica.beneficios}
                  nombre_empresa={practica.nombre_empresa}
                />
              ))}
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="flex flex-col mt-30 bg-gray-800/20 items-center rounded-3xl">
            <div className="flex flex-row items-center gap-8 m-12">
              <button
                onClick={() => setPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="text-2xl rounded-2xl text-white bg-orange-400 disabled:bg-gray-700 w-30 h-20 shadow-2xl"
              >
                Anterior
              </button>
              <span className="text-2xl text-white">
                Página {paginaActual} de {n_pages}
              </span>
              <button
                onClick={() => setPagina(paginaActual + 1)}
                disabled={paginaActual === n_pages}
                className="text-2xl rounded-2xl text-white bg-orange-500 disabled:bg-gray-700 w-30 h-20 shadow-2xl"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
