import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardPracticas from "../Components/Card_Practicas";
import NavBar from "../Components/NavBar";
import Loader from "../Components/Loader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface PracticaFromApi {
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
}

interface PracticasData {
  practicas: PracticaFromApi[]; 
  total: number;
}

export default function PracticasIniciales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paginaActual = Number(searchParams.get("pagina") ?? 1);

  const [data, setData] = useState<PracticasData>({ practicas: [], total: 0 });
  const [sData, setSData] = useState<PracticasData>({ practicas: [], total: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const n_pages = Math.max(1, Math.ceil(data.total / 10));
  const baseUrl = BUILD_MODE ? API_BASE_URL : 'http://localhost:3000';

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/practicas/inicial?pagina=${paginaActual}`)
      .then((res) => {
        console.log('Fetch response:', res);
        return res.json();
      })
      .then((json) => {
        console.log('Fetch data:', json);
        setData(json);
      })
      .finally(() => setLoading(false));
  }, [paginaActual]);


  const setPagina = (newPagina: number) => {
    const bounded = Math.min(Math.max(newPagina, 1), n_pages);
    setSearchParams({ pagina: String(bounded) });
  };

  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
        {loading && <Loader frase="Cargando Prácticas..." />}
        <NavBar />
        <div className="mt-20 flex flex-row gap-20 justify-center">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-10 ">
          {/* Mostrar lista general cuando no hay búsqueda activa */}
          {!loading && (
            data.practicas?.map((practica: PracticaFromApi) => (
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
                    baseUrl={baseUrl}
                  />
                )))}
              </div>
              <div className="flex justify-center mt-6 gap-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  onClick={() => setPagina(paginaActual - 1)}
                  disabled={paginaActual <= 1 || loading}
                >
                  Anterior
                </button>
                <span className="flex items-center">
                  Página {paginaActual} de {n_pages}
                </span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  onClick={() => setPagina(paginaActual + 1)}
                  disabled={paginaActual >= n_pages || loading}
                >
                  Siguiente
                </button> 
              </div>

        </div>
              <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center" >
              <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20 ">Práctica Inicial</h1>
              <p className="text-white/90 text-lg font-semibold text-center justify-center p-5 mt-5">
              lorem ipsom dolor sit amet, consectetur adipiscing elit. Donec vehicula cursus vestibulum. 
              Maecenas euismod, justo at consectetur congue, nisl nunc consectetur nisi, 
              euismod aliquam nisl nunc euismod nisi.
              </p>
            </div>
          
    
      </div>
    </main>
  );
}
