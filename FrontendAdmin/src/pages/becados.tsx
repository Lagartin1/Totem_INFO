import { useState, useEffect } from "react";
import Card_Becados from "../components/Card_Becados";
import type { Becado } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/loader";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Becado from "../components/Modal_Agregar_Becado";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Becados() {
  const [becados, setBecados] = useState<Becado[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // 🔁 Función para cargar becados
  const fetchBecados = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/becados`);
      const json = await res.json();
      setBecados(json.becados ?? []);
    } catch (err) {
      console.error("Error al obtener becados:", err);
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
      onDelete={(id) =>
        setBecados((prev) => prev.filter((x) => x.id !== id))
      }
      onAdded={fetchBecados}
    />
  ));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Becados</h2>

      <div className="py-10 flex flex-col items-center gap-6">
        {loading && <Loading frase="Cargando becados..." />}

        <div className="relative w-full">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {!loading && slides.length > 0 && (
              <Carousel key={becados.length} slides={slides} />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-64 text-white p-4">
        <Boton_Landing Title="Agregar Becado" onClick={openModal} />
      </div>

      {/* 👇 Pasamos la función para refrescar */}
      <Modal_Agregar_Becado
        isOpen={isModalOpen}
        closeModal={closeModal}
        onAdded={fetchBecados}
      />
    </div>
  );
}
