import { useState } from "react";
import ReactDOM from "react-dom";

interface ProyectoProps {
  titulo: string;
  area: string;
  autor: string;
  resumen: string;
}

function Card_Tesis({ titulo, area, autor, resumen }: ProyectoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const modalContent = (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col h-[70vh] w-[60vw] bg-white rounded-xl text-justify overflow-y-auto p-10">
        {/* 🔹 Título */}
        <h2 className="text-2xl font-semibold mb-6 text-center">{titulo}</h2>

        {/* 🔹 Autor y área */}
        <div className="flex flex-col gap-3 mb-10">
          <p>
            <span className="font-semibold">Autor:</span> {autor}
          </p>
          <p>
            <span className="font-semibold">Área de desarrollo:</span> {area}
          </p>
          <p>
            <span className="font-semibold">Resumen:</span> {resumen}
          </p>
        </div>

        {/* 🔹 Espacio reservado para QR */}
        <div className="flex justify-center items-center border border-dashed border-gray-400 rounded-lg h-48">
          <span className="text-gray-500">[ Aquí va el QR ]</span>
        </div>

        {/* 🔹 Botón cerrar */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={closeModal}
            className="bg-red-500 hover:bg-red-600 text-white
                      px-6 py-2 rounded-lg font-semibold transition duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Card resumida */}
      <div className="min-w-[250px] max-w-[250px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
        <h3 className="font-bold text-lg mb-1">{titulo}</h3>
        <p className="text-gray-600 text-sm">{autor}</p>
        <p className="text-gray-500 text-sm mb-4">{area}</p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {resumen}
        </p>

        <button
          onClick={openModal}
          className="text-blue-500 font-medium hover:underline mt-auto">
          Leer más
        </button>
      </div>

      {/* Render del modal usando Portal */}
      {isModalOpen && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}

export default Card_Tesis;
