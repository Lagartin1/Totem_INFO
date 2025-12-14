import { useState } from "react";
import NoticiaModal from "./Modal_Noticias";
import EdicionModal from "./Modal_Edicion_Noticias";
import type { Noticia } from "../types/index";
import renderEditorContent from "../lib/renderEditorContent";

interface NoticiaCardProps {
  noticia: Noticia;
  loading?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onAdded?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function NoticiaCard({
  noticia,
  onDelete,
  onAdded,
}: NoticiaCardProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Noticia>>(noticia);
  const [deleting, setDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Función para eliminar la noticia
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmar = confirm("¿Seguro que quieres eliminar esta noticia?");
    if (!confirmar) return;
    const performDeelete = async () => {
      try {
        setDeleting(true);
        const res = await fetch(`${baseUrl}/api/noticias/${noticia.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401) {
          const refreshRes = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
            method: "GET",
            credentials: "include",
          });
          if (refreshRes.ok) {
            const retryRes = await fetch(
              `${baseUrl}/api/noticias/${noticia.id}`,
              {
                method: "DELETE",
                credentials: "include",
              }
            );
            if (!retryRes.ok) {
              throw new Error(
                "Error al eliminar noticia después de refrescar token"
              );
            } else {
              return retryRes;
            }
          }
        }
        if (!res.ok) {
          throw new Error("Error al eliminar noticia");
        }
        return res;
      } finally {
        setDeleting(false);
      }
    };

    try {
      setDeleting(true);
      const res = await performDeelete();
      if (!res.ok) throw new Error("Error al eliminar noticia");
      alert("Noticia eliminada correctamente ✅");

      onDelete?.(noticia.id);
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      alert("Hubo un problema al eliminar la noticia ❌");
    } finally {
      setDeleting(false);
    }
  };

  // Función para editar una noticia
  // acepta overrides para campos que vienen directamente del editor (por ejemplo contenido)
  const handleEdit = async (e: React.MouseEvent, overrides?: Record<string, string>) => {
    e.stopPropagation();
    if (!confirm("¿Deseas guardar los cambios?")) return;

    try {
      setEditing(true);
      const formData = new FormData();
      

      ["titulo", "descripcion", "contenido", "autor"].forEach((key) => {
        const overrideVal = overrides && overrides[key];
        const value = overrideVal !== undefined ? overrideVal : editData[key as keyof Noticia];
        if (value !== undefined && value !== null) {
          if (typeof value === 'string') {
            if (value.trim() !== '') formData.append(key, value as any);
          } else {
            formData.append(key, value as any);
          }
        }
      });

      // log FormData entries for debugging
      try {
        Array.from(formData.entries());
      } catch (err) {
      }

      // Si el editor pasó HTML separado, también anexarlo
      if (overrides && overrides.contenido_html) {
        formData.append('contenido_html', overrides.contenido_html);
      } else if ((editData as any).contenido_html) {
        formData.append('contenido_html', (editData as any).contenido_html as string);
      }

      if (selectedFile) formData.append("imagen", selectedFile);

      if (removeImage) formData.append("eliminarImagen", "true");

      const perfromPut = async () => {
        try {
          const res = await fetch(`${baseUrl}/api/noticias/${noticia.id}`, {
            method: "PUT",
            body: formData,
            credentials: "include",
          });
          if (res.status === 401) {
            const refreshRes = await fetch(
              `${baseUrl}/api/admin/auth/refresh`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            if (refreshRes.ok) {
              const retryRes = await fetch(
                `${baseUrl}/api/noticias/${noticia.id}`,
                {
                  method: "PUT",
                  body: formData,
                  credentials: "include",
                }
              );
              if (!retryRes.ok) {
                console.error("Error al actualizar noticia después de refrescar token:", retryRes);
                throw new Error(
                  "Error al actualizar noticia después de refrescar token"
                );
              } else {
                return retryRes;
              }
            }
          }
          if (!res.ok) {
            throw new Error("Error al actualizar noticia");
          }
          return res;
        } catch (error) {
          throw error;
        }
      };

      const res = await perfromPut();

      if (!res.ok) throw new Error("Error al actualizar la noticia");

      alert("Noticia actualizada correctamente ✅");
      onAdded?.();
      setEditOpen(false);
      setRemoveImage(false);
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
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
          <div
            className="mt-2 text-sm text-gray-600 max-h-24 overflow-hidden"
            // mostrar preview formateado (no editable)
            dangerouslySetInnerHTML={{
              __html: (noticia as any).contenido_html
                ? (noticia as any).contenido_html
                : renderEditorContent(noticia.contenido),
            }}
          />
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

      <NoticiaModal
        isOpen={open}
        onClose={() => setOpen(false)}
        noticia={noticia}
      />

      <EdicionModal
        key={noticia.id}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editData={editData}
        setEditData={setEditData}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        removeImage={removeImage}
        setRemoveImage={setRemoveImage}
        handleEdit={handleEdit}
        editing={editing}
      />
    </>
  );
}
