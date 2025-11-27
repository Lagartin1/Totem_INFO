import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardPracticas from "../Components/Card_Practicas";
import NavBar from "../Components/NavBar";
import Loader from "../Components/Loader";
import { useNavigate } from "react-router-dom";


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

export default function Practicas() {
  const nav = useNavigate();
  const param = window.location.pathname.split("/").pop();
  const type = param === "iniciales" ? "inicial" : "profesional";

  const [searchParams, setSearchParams] = useSearchParams();
  const paginaActual = Number(searchParams.get("pagina") ?? 1);
  const [years, setYears] = useState<number[]>([]);
  const [filterModalidad, setFilterModalidad] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);


  const [data, setData] = useState<PracticasData>({ practicas: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const n_pages = Math.max(1, Math.ceil(data.total / 10));

  const cargar = async(pagina: number,years:string| null) => {
    setLoading(true);
    if (years){
      const res = await fetch(`/api/practicas/${type}?pagina=${pagina}&year=${years}`);
      const json =  await res.json();
      setData(json);
      setLoading(false);
      return;
    }else{
    const res = await fetch(`/api/practicas/${type}?pagina=${pagina}`);
    const yearsRes = await fetch(`/api/practicas/${type}/years`);
    const yearsJson = await yearsRes.json();
    const json =  await res.json();
    setYears(yearsJson);
    setData(json);
    setLoading(false);
    }
  }

   useEffect(() => {
    if (param !== "iniciales" && param !== "profesionales") {
      nav("/");
    }
    cargar(paginaActual,selectedYear);
  }, [paginaActual,selectedYear,param]);


  const setPagina = (newPagina: number) => {
    const bounded = Math.min(Math.max(newPagina, 1), n_pages);
    setSearchParams({ pagina: String(bounded) });
  };

  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
        {loading && <Loader frase="Cargando Prácticas Iniciales..." />}
        <NavBar />
        <div className="mt-20 flex flex-row gap-20 justify-center">
          <div className="flex flex-col gap-2">
            {!loading && (
                
              <div className="flex flex-row gap-2 mb-4 items-center bg-white/80 p-2 rounded-2xl justify-center w-1/3">
                <label htmlFor="years" className="font-semibold">Filtrar por Año:</label>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => {
                  if (filterModalidad) {
                    setFilterModalidad(false);
                  } else {
                    setFilterModalidad(true);
                  }
                }}>
                  Seleccionar Año
                </button>
                {filterModalidad && ( 
              <div className="absolute mt-12 bg-white border border-gray-300 rounded shadow-lg z-10">
                <ul>
                  <li
                    key={"all_years"}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setSelectedYear(null);
                      setFilterModalidad(false);
                      cargar(1,null);
                      setSearchParams({ pagina: '1' });
                    }}
                  >
                    Todos los años
                  </li>
                  {years.map((year) => (
                    <li
                      key={year}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setSelectedYear(String(year));
                        setFilterModalidad(false);
                        cargar(1,String(year));
                        setSearchParams({ pagina: '1' });
                      }}
                    >
                      {year}
                    </li>
                  ))}
                </ul>
              </div>
            )} 
                <button className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300" onClick={() => {
                  setSelectedYear(null);
                  setFilterModalidad(false);
                  cargar(1,null);
                  setSearchParams({ pagina: '1' });
                }}
                disabled={!selectedYear}
                
                >
                  Quitar Filtro
                </button>
                
              </div>
            ) 
            }
          
          <div className="grid grid-cols-3 gap-10 ">
            {/* Mostrar lista general cuando no hay búsqueda activa */}
            {!loading && (
              data.practicas?.map((practica: PracticaFromApi) => {
              const props = {
                id: practica.id,
                Titulo: practica.labores,
                empresa: practica.nombre_empresa,
                modalidad: practica.modalidad,
                sede: practica.sede_practica,
                beneficios: practica.beneficios,
                requisitos: practica.requisitos_especiales,
                contacto: practica.nombre_contacto,
                email: practica.email_contacto,
                telefono: practica.telefono_contacto,
                cargo: practica.cargo_contacto,
                regimen: practica.regimen_trabajo,
              } as any;
              return <CardPracticas key={practica.id} {...props} />;
              })
            )}
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
            <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20 ">Práctica {type==="inicial"? "Inicial": "Profesional"}</h1>
            {!loading && selectedYear && (
              <h2 className="text-white text-2xl font-semibold justify-center -mt-5 ">
                Año {selectedYear}
              </h2>
            )}
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
