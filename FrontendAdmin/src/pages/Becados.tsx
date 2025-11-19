import { useState, useEffect } from "react";
import Card_Becados from "../components/Card_Becados";
import type { Becado } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/Loader";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Becado from "../components/Modal_Agregar_Becado";
import Nav_button from "../components/Nav_Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Becados() {
  const [becados, setBecados] = useState<Becado[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Nuevo estado para errores
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Función para cargar becados (MEJORADA)
  const fetchBecados = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch(`${baseUrl}/api/becados`);

      // 1. Verificar si el servidor respondió con éxito (Status 200-299)
      if (!res.ok) {
        // Si es error 500 o 404, lanzamos un error legible
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }

      // 2. Si todo está bien, convertimos a JSON
      const json = await res.json();
      setBecados(json.becados ?? []);
      
    } catch (err: any) {
      console.error("❌ Error al obtener becados:", err);
      setErrorMsg(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBecados();
  }, []);

  const slides = becados.map((becado) => (
    <Card_Becados
      key={becado.id}
      becado={becado}
      onDelete={(id) => setBecados((prev) => prev.filter((x) => x.id !== id))}
      onAdded={fetchBecados}
    />
  ));

  return (
    <main className="p-6 w-full min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Becados</h2>
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/dashboard" />
      </div>
      <div className="p-6">
        <div className="py-10 flex flex-col items-center gap-6">
          
          {/* Mensaje de error visual si falla la carga */}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{errorMsg}</span>
            </div>
          )}

          {loading && <Loading frase="Cargando becados..." />}

          <div className="relative w-full">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {!loading && slides.length > 0 ? (
                <Carousel key={becados.length} slides={slides} />
              ) : (
                !loading && !errorMsg && <p className="text-gray-500">No hay becados registrados.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto w-64 text-white p-4">
          <Boton_Landing Title="Agregar Becado" onClick={openModal} />
        </div>

        <Modal_Agregar_Becado
          isOpen={isModalOpen}
          closeModal={closeModal}
          onAdded={fetchBecados}
        />
      </div>
    </main>
  );
}