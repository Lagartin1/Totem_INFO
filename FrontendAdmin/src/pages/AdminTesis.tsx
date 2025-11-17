import { useState, useEffect } from "react";
import Card_Tesis from "../components/Card_Tesis";
import type { Tesis } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/Loader";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Tesis from "../components/Modal_Agregar_Tesis";
import Nav_button from "../components/Nav_Button";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Tesis() {
  const nav = useNavigate();
  const [tesis, setTesis] = useState<Tesis[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const fetchTesis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/tesis`);
      const json = await res.json();
      setTesis(json.tesis ?? []);
    } catch (err) {
      console.error("Error al obtener tesis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTesis();
  }, []);

  const slides = tesis.map((tesisItem) => (
    <Card_Tesis
      key={tesisItem.id}
      tesis={tesisItem}
      onDelete={(id) => setTesis((prev) => prev.filter((x) => x.id !== id))}
      onAdded={fetchTesis}
    />
  ));

  return (
    <div className="p-6">
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/dashboard" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Tesis</h2>

      <div className="py-10 flex flex-col items-center gap-6">
        {loading && <Loading frase="Cargando tesis..." />}

        <div className="relative w-full">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {!loading && slides.length > 0 && (
              <Carousel key={tesis.length} slides={slides} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-white mt-20">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md h-30 text-2xl hover:bg-slate-700"
          onClick={() => nav("/tesis/top-visitadas")}>
          {" "}
          Top Tesis Visitadas
        </button>
        <Boton_Landing Title="Agregar Tesis" onClick={openModal} />
      </div>

      {/* 18. Usa el Modal_Agregar_Tesis */}
      <Modal_Agregar_Tesis
        isOpen={isModalOpen}
        closeModal={closeModal}
        // 19. Pasa la función de fetch correcta
        onAdded={fetchTesis}
      />
    </div>
  );
}
