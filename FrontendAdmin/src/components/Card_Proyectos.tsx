import { useState } from "react";
import type { Proyecto } from "../types/index";
import Modal_Proyectos from "./Modal_Proyectos";

interface CardProyectosProps {
  proyecto: Proyecto;
}

export default function Card_Proyectos({ proyecto }: CardProyectosProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Card */}
      <div className="min-w-[250px] max-w-[250px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
        <h3 className="font-bold text-lg mb-1">{proyecto.titulo}</h3>
        <p className="text-gray-600 text-sm">{proyecto.autores}</p>
        <p className="text-gray-500 text-sm mb-4">{proyecto.area_desarrollo}</p>
        <p className="text-gray-500 text-sm mb-4">
          {proyecto.correo_contacto} | {proyecto.telefono_contacto}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="text-blue-500 font-medium hover:underline mt-auto">
          Leer más
        </button>
      </div>

      <Modal_Proyectos 
        proyecto={proyecto}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
