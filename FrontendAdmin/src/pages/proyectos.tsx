import { useState, useEffect } from "react";
import Card_Proyectos from "../components/Card_Proyectos";
import type { Proyecto } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/loader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/proyectos`)
      .then((res) => res.json())
      .then((json) => setProyectos(json.proyectos ?? []))
      .catch((err) => console.error("Error en fetch inicial:", err))
      .finally(() => setLoading(false));
  }, []);

  const slides = proyectos.map((proyecto) => {
    return <Card_Proyectos proyecto={proyecto} />;
  });

  return (
    <div className="py-10 flex flex-col items-center gap-6">
      {/* 🔹 Loading Spinner */}
        {loading && (
          <Loading frase="Cargando proyectos..." />
        )}

      {/* Carrusel de resultados */}
      {!loading && slides.length > 0 && (
        <Carousel key={proyectos.length} slides={slides} />
      )}
    </div>
  );
}
