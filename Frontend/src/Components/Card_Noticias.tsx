import { useState } from "react";
import type { Noticia } from "../types/index";
import Modal_Noticias from "./Modal_Noticias";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface NoticiaCardProps {
  noticia: Noticia;
  loading?: boolean;
  onClick?: () => void;
}

export default function Card_Noticias({ noticia }: NoticiaCardProps) {
  const [open, setOpen] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  return (
    <>
      {/* Tarjeta */}
      <div
        className="min-w-[250px] max-w-[300px] bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition duration-300 cursor-pointer"
        onClick={() => setOpen(true)}>
        {noticia.imagen ? (
          <img
            src={
              noticia.imagen.startsWith("http")
                ? noticia.imagen
                : `${baseUrl}${noticia.imagen}`
            }
            alt={noticia.titulo}
            className="w-full h-auto rounded"
          />
        ) : (
          <>
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>{" "}
          </>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg">{noticia.titulo}</h3>
        </div>
      </div>

      {/* Modal */}
      <Modal_Noticias
        isOpen={open}
        onClose={() => setOpen(false)}
        noticia={noticia}
      />
    </>
  );
}
