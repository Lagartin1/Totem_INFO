import { useState } from "react";
import type { Becado } from "../types/index";
import Modal_Becados from "./Modal_Becados";
import Modal_Edicion_Becados from "./Modal_Edicion_Becados";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardBecadosProps {
  becado: Becado;
  onDelete?: (id: string) => void;
  onAdded?: () => void;
}

export default function Card_Becados({
  becado,
  onDelete,
  onAdded,
}: CardBecadosProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Becado>>(becado);
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [removeVideos, setRemoveVideos] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmar = confirm("¿Seguro que quieres eliminar este becado?");
    if (!confirmar) return;
    const performDelete = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/becados/${becado.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.status === 401) {
          const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
            method: "GET",
            credentials: "include",
          });
          if (refresh.ok) {
            const retryResponse = await fetch(
              `${baseUrl}/api/becados/${becado.id}`,
              {
                method: "DELETE",
                credentials: "include",
              }
            );
            if (!retryResponse.ok) {
              throw new Error("Error al eliminar el becado");
            }
            return retryResponse;
          }
        }
        if (!response.ok) {
          throw new Error("Error al eliminar el becado");
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    try {
      setDeleting(true);
      await performDelete();
      alert("Becado eliminado correctamente ✅");
      onDelete?.(becado.id);
    } catch (error) {
      console.error("Error al eliminar becado:", error);
      alert("Hubo un problema al eliminar el becado ❌");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Deseas guardar los cambios?")) return;

    try {
      setEditing(true);
      const formData = new FormData();

      ["nombre", "titulo", "descripcion", "fecha_publicacion"].forEach(
        (key) => {
          const value = editData[key as keyof Becado];
          if (typeof value === "string" && value.trim() !== "") {
            formData.append(key, value);
          }
        }
      );

      // Videos (array de strings o archivos)
      if (Array.isArray(editData.videos)) {
        editData.videos.forEach((video) => {
          // Si ya es una URL, la enviamos como texto
          if (typeof video === "string" && video.startsWith("/uploads")) {
            formData.append("videos[]", video);
          }
        });
      }

      if (selectedFile) {
        selectedFile.forEach((file) => {
          formData.append("videos[]", file);
        });
      }

      if (removeVideos) {
        formData.append("eliminarVideos", "true");
      }
      const performPut = async () => {
        try {
          const response = await fetch(
            `${baseUrl}/api/becados/${editData.id}`,
            {
              method: "PUT",
              body: formData,
              credentials: "include",
            }
          );
          if (response.status === 401) {
            const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
              method: "GET",
              credentials: "include",
            });
            if (refresh.ok) {
              const retryResponse = await fetch(
                `${baseUrl}/api/becados/${editData.id}`,
                {
                  method: "PUT",
                  body: formData,
                  credentials: "include",
                }
              );
              if (!retryResponse.ok) {
                throw new Error("Error al actualizar el becado");
              }
              return retryResponse;
            }
          }
          if (!response.ok) {
            throw new Error("Error al actualizar el becado");
          }
          return response;
        } catch (error) {
          throw error;
        }
      };
      const res = await performPut();

      if (!res.ok) throw new Error("Error al actualizar el becado");

      alert("Becado actualizado correctamente ✅");
      onAdded?.();
      setEditOpen(false);
    } catch (error) {
      console.error("Error al actualizar becado:", error);
      alert("Error al actualizar el becado ❌");
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="relative min-w-[350px] max-w-[350px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
        {/* Galería de videos */}
        {Array.isArray(becado.videos) && becado.videos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto mb-4">
            {becado.videos.map((videoUrl, index) => (
              <video
                key={index}
                className="w-full h-40 rounded-lg flex-shrink-0 object-cover"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                preload="metadata">
                <source src={`${baseUrl}${videoUrl}`} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
            ))}
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
            Sin videos
          </div>
        )}

        <h3 className="font-bold text-lg mb-1">{becado.titulo}</h3>

        <button
          onClick={() => setOpen(true)}
          className="mt-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Ver detalles
        </button>

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

      <Modal_Becados
        becado={becado}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <Modal_Edicion_Becados
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editData={editData}
        setEditData={setEditData}
        selectedVideos={selectedFile}
        setSelectedVideos={setSelectedFile}
        removeVideos={removeVideos}
        setRemoveVideos={setRemoveVideos}
        handleEdit={handleEdit}
        editing={editing}
      />
    </>
  );
}
