import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Loader from "../Components/Loader";
import type { Proyecto } from "../types/index";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function ProyectosDocentes() {
  const nav = useNavigate();
  const param = window.location.pathname.split("/").pop();
  const type = param === "profesores" ? "profesores" : "estudiantes";
  const [data, setData] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const cargar = async(type:string,page:number) => {
    setLoading(true);
    // Fetch proyectos basado en el tipo
    setLoading(false);
  }   
  useEffect(() => {
    if (param !== "profesores" && param !== "estudiantes") {
      nav("/");
    } else {
      cargar(type,1);
    }
  }, [type]);


  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
      {loading && <Loader frase="Cargando proyectos..." />}
      <NavBar />
      <div className="mt-20 flex flex-row gap-20 justify-center">
          <div className="flex flex-col gap-2">

          </div>
          <div className="grid grid-cols-3 gap-10 ">
            { /* Mostrar proyectos aquí  */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Proyecto 1</h2>
              <p className="text-gray-700">Descripción del proyecto 1.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Proyecto 1</h2>
              <p className="text-gray-700">Descripción del proyecto 1.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Proyecto 1</h2>
              <p className="text-gray-700">Descripción del proyecto 1.</p>
            </div>
          </div> 
      <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center" >
            <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20 ">Proyectos de {type==="profesores"? "Profesores": "Estudiantes"}</h1>
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
