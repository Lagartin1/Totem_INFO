import { useState } from "react";
import NoticiaModal from "./Modal_Noticias";
import EdicionModal from "./Modal_Edicion_Noticias";

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
  loading?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function NoticiaCard({ noticia, onDelete }: NoticiaCardProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Noticia>>(noticia);
  const [deleting, setDeleting] = useState(false);
  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Función para eliminar la noticia
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmar = confirm("¿Seguro que quieres eliminar esta noticia?");
    if (!confirmar) return;

    try {
      setDeleting(true);
      const res = await fetch(`${baseUrl}/api/noticias/${noticia.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la noticia");
      }

      alert("Noticia eliminada correctamente ✅");

      // 🔹 Notificar al componente padre (NoticiasSection) si existe la función
      onDelete?.(noticia.id);
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      alert("Hubo un problema al eliminar la noticia ❌");
    } finally {
      setDeleting(false);
    }
  };

  // Función para editar una noticia
  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmar = confirm("¿Deseas guardar los cambios?");
    if (!confirmar) return;

    try {
      setEditing(true);
      const res = await fetch(`${baseUrl}/api/noticias/${noticia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Error al actualizar la noticia");

      alert("Noticia actualizada correctamente ✅");
      setOpen(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar la noticia ❌");
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      {/* Tarjeta */}
      <div
        className="relative min-w-[250px] max-w-[300px] bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition duration-300 cursor-pointer"
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
        <button
          onClick={(e) => {
            setEditOpen(true);
            e.stopPropagation();
          }}
          className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm">
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50">
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>

      {/* Modal */}
      <NoticiaModal
        isOpen={open}
        onClose={() => setOpen(false)}
        noticia={noticia}
      />

      <EdicionModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editData={editData}
        setEditData={setEditData}
        handleEdit={handleEdit}
        editing={editing}
      />
    </>
  );
}
