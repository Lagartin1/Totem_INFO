import { useEffect, useState, useRef } from "react";
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
  correo_contacto: string;
  regimen_trabajo: string;
  requisitos_especiales: string;
  fechas_practica: string;
  modalidad: string;
  beneficios: string;
  nombre_empresa: string;
  state: boolean;
}

interface PracticasData {
  practicas: PracticaFromApi[]; 
  total: number;
}

const descriptionText ={
  inicial: "La práctica inicial corresponde a una primera experiencia formativa en un entorno laboral real, donde el estudiante aplica conocimientos básicos de informática y se integra a un equipo de trabajo. Tiene una duración mínima de 180 horas y requiere haber aprobado el ciclo de bachillerato de la carrera. \n El objetivo es que el estudiante participe en tareas relacionadas con el área, cuente con supervisión constante y pueda desarrollar progresivamente autonomía, capacidad de organización y adaptación a proyectos tecnológicos. La institución asigna un supervisor encargado de guiar las actividades y evaluar el desempeño. Al finalizar, el estudiante debe entregar un informe que describa lo realizado y los aprendizajes obtenidos, el cual será evaluado por los docentes de la asignatura correspondiente.",
  profesional: "La práctica profesional constituye una instancia avanzada de aplicación integral de conocimientos, realizada tras aprobar los ocho primeros semestres de la carrera. Exige un mínimo de 360 horas en una organización y busca que el estudiante desempeñe funciones propias de un profesional del área, bajo la orientación de un supervisor designado.\nDurante su desarrollo, el estudiante contribuye a proyectos o procesos tecnológicos, ejercita competencias técnicas y profesionales, y participa activamente en el equipo de trabajo. La Escuela realiza seguimientos formativos y, al finalizar, se requiere un informe detallado y la evaluación del supervisor. La aprobación depende de la participación en las actividades de la asignatura, la calidad del informe y una evaluación positiva por parte de la organización."
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
  const filterRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const [n_pages,setNapges] = useState<number>(1);

  const [data, setData] = useState<PracticasData>({ practicas: [], total: 0 });
  const [loading, setLoading] = useState(false);
  


  const cargar = async(pagina: number,years:string| null) => {
    setLoading(true);
    try {
      if (years){
        const res = await fetch(`/api/practicas/${type}?pagina=${pagina}&year=${years}`);
        const json =  await res.json();
        
        setData(json);
        setNapges(Math.ceil(json.total/6));
        setLoading(false);
        return;
      }else{
      const res = await fetch(`/api/practicas/${type}?pagina=${pagina}`);
      const yearsRes = await fetch(`/api/practicas/${type}/years`);
      const yearsJson = await yearsRes.json();
      const json =  await res.json();
      setYears(yearsJson);
      setData(json);
      setNapges(Math.ceil(json.total/6));
      setLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar las prácticas:", error);
      setLoading(false);
    }
    
  }

   useEffect(() => {
    if (param !== "iniciales" && param !== "profesionales") {
      nav("/");
    }
    cargar(paginaActual,selectedYear);
  }, [paginaActual,selectedYear,param]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        filterModalidad &&
        filterRef.current &&
        !filterRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        setFilterModalidad(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterModalidad]);


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
                
              <div className="flex flex-row gap-2 mb-4 items-center bg-white/95 p-2 rounded-2xl justify-center w-1/3 ">
                <label htmlFor="years" className="font-semibold">Filtrar por Año:</label>
                <button ref={filterButtonRef} className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => {
                  if (filterModalidad) {
                    setFilterModalidad(false);
                  } else {
                    setFilterModalidad(true);
                  }
                }}>
                  Seleccionar Año
                </button>
                  {filterModalidad && ( 
                <div ref={filterRef} className="absolute top-70 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-70 overflow-y-auto">
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
            {!loading && data.practicas.length > 0 && (
              data.practicas?.map((practica: PracticaFromApi) => {
              const props = {
                id: practica.id,
                Titulo: practica.labores,
                lugar: practica.sede_practica,
                nombre_contacto: practica.nombre_contacto,
                telefono_contacto: practica.telefono_contacto,
                cargo_contacto: practica.cargo_contacto,
                email_contacto: practica.correo_contacto,
                regimen_trabajo: practica.regimen_trabajo,
                requisitos: practica.requisitos_especiales,
                modalidad: practica.modalidad,
                beneficios: practica.beneficios,
                nombre_empresa: practica.nombre_empresa,
                fecha: practica.fechas_practica,
                baseUrl: "",
                state: practica.state,
              } as any;
              return <CardPracticas key={practica.id} {...props} />;
              })
            )}
            {!loading && data.practicas.length === 0 && (
              <p className="text-center col-span-3">No se encontraron prácticas.</p>
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
             {descriptionText[type]}
            </p>
          </div>
      </div>
    </main>
  );
}
