import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Loader from "../Components/Loader";
import Card_Main from "../Components/Card_Main";
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

  const cargar = async(type: string, page: number) => {
    setLoading(true);
    try {
      // Fetch proyectos basado en el tipo
      const endpoint = `${baseUrl}/api/proyectos/${type}?page=${page}`;
      const response = await fetch(endpoint);
      const result = await response.json();
      setData(result.data || result || []);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }   
  useEffect(() => {
    if (param !== "profesores" && param !== "estudiantes") {
      nav("/");
    } else {
      cargar(type, 1);
    }
  }, [type, param, nav]);

  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
      {loading && <Loader frase="Cargando proyectos..." />}
      <NavBar />
      <div className="mt-20 flex flex-row gap-20 justify-center w-full px-10">
        {/* Sección de descripción */}
        <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center h-fit sticky top-32">
          <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20">Proyectos de {type === "profesores" ? "Profesores" : "Estudiantes"}</h1>
          <p className="text-white/90 text-lg font-semibold text-center justify-center p-5 mt-5 pb-10">
            Explora proyectos creados por docentes y estudiantes de Ingenieria Civil Informatica:
            soluciones de software, investigaciones aplicadas y prototipos listos para escalar. Aqui
            se concentra el trabajo colaborativo que conecta la sala de clases con desafios reales
            de la industria tecnologica.
          </p>
        </div>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
          {data && data.length > 0 ? (
            data.map((proyecto) => (
              <Card_Main
                key={proyecto.id}
                item={proyecto}
                type="proyecto"
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No hay proyectos disponibles
              </h3>
              <p className="text-gray-500 text-lg">
                Por el momento no hay proyectos registrados.
                <br />
                Vuelve pronto para conocer los trabajos desarrollados por estudiantes y profesores.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
