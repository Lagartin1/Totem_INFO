import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardPracticas from "../Components/CardPracticas";
import  Header  from "../Components/Header"

interface CardPracticasProps {
    id:string;
    labores: string;
    sede_practica: string;
    nombre_contacto: string;
    telefono_contacto: string;
    cargo_contacto: string;
    email_contacto: string;
    regimen_trabajo: string;
    requisitos_especiales: string;
    modalidad:string;
    beneficios:string;
    nombre_empresa:string;
    total:number;
}

interface PracticasData {
    practicas: CardPracticasProps[];
    total: number;
}




export default function PracticasIniciales() {
const [searchParams, setSearchParams] = useSearchParams();
  const paginaActual = Number(searchParams.get("pagina") ?? 1);
  const [data, setData] = useState<PracticasData>({ practicas: [], total: 0 });
  
  
  
  useEffect(() => {
      fetch(`http://localhost:3000/api/practicas/practicaInicial?pagina=${paginaActual}`)
      .then(res => res.json())
      .then(json => setData(json));
    }, [paginaActual]);
    console.log(data)
    const n_pages = Math.max(1, Math.ceil(data.total / 10));
    
    const setPagina = (newPagina: number) => {
        const bounded = Math.min(Math.max(newPagina, 1), n_pages);
        setSearchParams({ pagina: String(bounded) });
    };
    return (
        <main className="min-h-screen p-6">
            <Header />
            <div className="py-10 flex flex-col items-center text-justify m-10 gap-6">
                <div className="grid grid-cols-3 gap-20 md:grid-cols-1 lg:grid-cols-3">
                    {data.practicas?.map((practica: CardPracticasProps) => (
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
                <div className="flex flex-col mt-30 bg-gray-800/20  items-center rounded-3xl
                ">
                    <div className="flex flex-row items-center gap-8 m-12  ">
                        <button onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1} className="  text-2xl rounded-2xl text-white bg-orange-400 disabled:bg-gray-700 w-30 h-20  shadow-2xl">
                        Anterior
                        </button>
                        <span
                        className="text-2xl text-white"
                        >Página {paginaActual} de {n_pages}</span>
                        <button onClick={() => setPagina(paginaActual + 1)} disabled={paginaActual === n_pages} className="  text-2xl rounded-2xl text-white bg-orange-500 disabled:bg-gray-700 w-30 h-20 shadow-2xl">
                        Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}



