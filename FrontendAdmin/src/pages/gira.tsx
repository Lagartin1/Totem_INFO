import { useState, useEffect } from "react";
import Card_Gira from "../components/Card_Gira";
import type { Gira } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/loader";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Gira from "../components/Modal_Agregar_Gira";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Gira() {
  const [giras, setGiras] = useState<Gira[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // 🔁 Función para cargar giras
  const fetchGiras = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/giras`);
      const json = await res.json();
      setGiras(json.giras ?? []);
    } catch (err) {
      console.error("Error al obtener giras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiras();
  }, []);

  const slides = giras.map((gira) => (
    <Card_Gira
      key={gira.id}
      gira={gira}
      onDelete={(id) =>
        setGiras((prev) => prev.filter((x) => x.id !== id))
      }
      onAdded={fetchGiras}
    />
  ));

  return (
    <main className="p-6 w-full min-h-screen">
      <div className="">
        <h2 className="text-2xl font-bold mb-4">Giras</h2>

        <div className="py-10 flex flex-col items-center gap-6">
          {loading && <Loading frase="Cargando giras..." />}

          <div className="relative w-full">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {!loading && slides.length > 0 && (
                <Carousel key={giras.length} slides={slides} />
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto w-64 text-white p-4">
          <Boton_Landing Title="Agregar Gira" onClick={openModal} />
        </div>

        {/* 👇 Pasamos la función para refrescar */}
        <Modal_Agregar_Gira
          isOpen={isModalOpen}
          closeModal={closeModal}
          onAdded={fetchGiras}
        />
      </div>
    </main>
  );
}
