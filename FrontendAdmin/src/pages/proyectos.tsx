import { useState, useEffect } from "react";
import Card_Proyectos from "../components/Card_Proyectos";
import type { Proyecto } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/loader";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Proyecto from "../components/Modal_Agregar_Proyecto";
import Nav_button from "../components/nav_button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // 🔁 Función para cargar proyectos
  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/proyectos`);
      const json = await res.json();
      setProyectos(json.proyectos ?? []);
    } catch (err) {
      console.error("Error al obtener proyectos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  const slides = proyectos.map((proyecto) => (
    <Card_Proyectos
      key={proyecto.id}
      proyecto={proyecto}
      onDelete={(id) => setProyectos((prev) => prev.filter((x) => x.id !== id))}
      onAdded={fetchProyectos}
    />
  ));

  return (
    <main className="p-6 w-full min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Proyectos</h2>
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/dashboard" />
      </div>
      <div className="p-6">
        <div className="py-10 flex flex-col items-center gap-6">
          {loading && <Loading frase="Cargando proyectos..." />}

          <div className="relative w-full">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {!loading && slides.length > 0 && (
                <Carousel key={proyectos.length} slides={slides} />
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto w-64 text-white p-4">
          <Boton_Landing Title="Agregar Proyecto" onClick={openModal} />
        </div>

        {/* 👇 Pasamos la función para refrescar */}
        <Modal_Agregar_Proyecto
          isOpen={isModalOpen}
          closeModal={closeModal}
          onAdded={fetchProyectos}
        />
      </div>
    </main>
  );
}
