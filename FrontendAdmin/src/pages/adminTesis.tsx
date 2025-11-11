import { useState, useEffect } from "react";
import Card_Tesis from "../components/Card_Tesis";
import type { Tesis } from "../types/index";
import Carousel from "../components/Carousel";
import Loading from "../components/loader";
import Boton_Landing from "../components/Boton_Landing";
import Modal_Agregar_Tesis from "../components/Modal_Agregar_Tesis";
import Nav_button from "../components/nav_button";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Tesis() {
  // 4. Cambia el nombre del estado y el tipo
  const nav = useNavigate();
  const [tesis, setTesis] = useState<Tesis[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // 5. Cambia el nombre de la función de fetch
  const fetchTesis = async () => {
    try {
      setLoading(true);
      // 6. Actualiza el endpoint de la API
      const res = await fetch(`${baseUrl}/api/tesis`); // Asumo que esta es tu ruta
      const json = await res.json();
      // 7. Ajusta al formato de tu TesisResponse ({ tesis: [], total: ... })
      setTesis(json.tesis ?? []);
    } catch (err) {
      // 8. Actualiza el mensaje de error
      console.error("Error al obtener tesis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 9. Llama a la nueva función
    fetchTesis();
  }, []);

  // 10. Mapea sobre el estado 'tesis'
  const slides = tesis.map((tesisItem) => (
    // 11. Usa el componente Card_Tesis
    <Card_Tesis
      key={tesisItem.id}
      tesis={tesisItem} // Asumo que el prop se llamará 'tesis'
      onDelete={(id) =>
        // 12. Actualiza el estado 'tesis'
        setTesis((prev) => prev.filter((x) => x.id !== id))
      }
      // 13. Pasa la función de fetch correcta
      onAdded={fetchTesis}
    />
  ));

  return (
    <div className="p-6">
        <div className="px-30 py-10">
          <Nav_button Title="Volver" Link="/" />
        </div>
      {/* 14. Cambia el título */}
      <h2 className="text-2xl font-bold mb-4">Tesis</h2>

      <div className="py-10 flex flex-col items-center gap-6">
        {/* 15. Cambia el texto de carga */}
        {loading && <Loading frase="Cargando tesis..." />}

        <div className="relative w-full">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {!loading && slides.length > 0 && (
              // 16. Pasa la longitud del estado 'tesis'
              <Carousel key={tesis.length} slides={slides} />
            )}
          </div>
        </div>
      </div>



      <div className="grid grid-cols-3 gap-4 text-white mt-20">
        <button className='bg-blue-500 text-white px-4 py-2 rounded-md h-30 text-2xl hover:bg-slate-700' onClick={() => nav("/tesis/top-visitadas")}> Top Prácticas Visitadas</button>
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