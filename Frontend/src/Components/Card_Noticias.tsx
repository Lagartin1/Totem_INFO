import { useState } from "react";
import NoticiaModal from "./Modal_Noticias";

interface Noticia {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  autor: string;
  fecha_publicacion: string;
  imagen?: string;
}

interface NoticiaCardProps {
  noticia: Noticia;
}

export default function NoticiaCard({ noticia }: NoticiaCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tarjeta */}
      <div
        className="min-w-[250px] max-w-[300px] bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
        onClick={() => setOpen(true)}
      >
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div> 
        <div className="p-4">
          <h3 className="font-semibold text-lg">{noticia.titulo}</h3>
        </div>
      </div>

      {/* Modal */}
      <NoticiaModal
        isOpen={open}
        onClose={() => setOpen(false)}
        noticia={noticia}
      />
    </>
  );
}
