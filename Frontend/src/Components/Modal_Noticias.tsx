import { createPortal } from "react-dom";

interface Noticia {
  titulo: string;
  descripcion: string;
  contenido: string;
  autor: string;
  fecha_publicacion: string;
  imagen?: string;
}

interface NoticiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticia: Noticia | null;
};

export default function NoticiaModal({ isOpen, onClose, noticia }: NoticiaModalProps) {
  if (!isOpen || !noticia) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // 👈 click fuera cierra
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // 👈 evita que el click dentro cierre
      >

        {/* Imagen de la noticia */}
        {noticia.imagen && (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="w-full h-64 object-cover rounded-2xl mb-4"
          />
        )}

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{noticia.titulo}</h1>

        {/* Información de la noticia */}
        <p className="text-sm text-gray-500">
          {noticia.autor} — {new Date(noticia.fecha_publicacion).toLocaleDateString()}
        </p>

        {/* Descripción */}
        <p className="mt-2 text-lg text-gray-700">{noticia.descripcion}</p>

        {/* Contenido */}
        <div className="mt-4 text-gray-800 leading-relaxed">{noticia.contenido}</div>

        {/* Botón de volver */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
