import { useState } from "react";
import type { Gira } from "../types/index";
import Modal_Gira from "./Modal_Gira";
import Modal_Edicion_Gira from "./Modal_Edicion_Gira";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardGiraProps {
  gira: Gira;
  onDelete?: (id: string) => void;
  onAdded?: () => void;
}

export default function Card_Gira({ gira, onDelete, onAdded }: CardGiraProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Gira>>(gira);
  const [selectedVideos, setSelectedVideos] = useState<File[] | null>(null);
  const [selectedImagenes, setSelectedImagenes] = useState<File[] | null>(null);
  const [selectedPortada, setSelectedPortada] = useState<File | null>(null);
  const [removeVideos, setRemoveVideos] = useState(false);
  const [removeImagenes, setRemoveImagenes] = useState(false);
  const [removePortada, setRemovePortada] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmar = confirm("¿Seguro que quieres eliminar esta gira?");
    if (!confirmar) return;
    const performDelete = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/gira/${gira.id}`, {
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
              `${baseUrl}/api/gira/${gira.id}`,
              {
                method: "DELETE",
                credentials: "include",
              }
            );
            if (!retryResponse.ok) {
              throw new Error("Error al eliminar la gira");
            }
            return retryResponse;
          }
        }
        if (!response.ok) {
          throw new Error("Error al eliminar la gira");
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    try {
      setDeleting(true);
      await performDelete();
      alert("Gira eliminada correctamente ✅");
      onDelete?.(gira.id);
    } catch (error) {
      console.error("Error al eliminar gira:", error);
      alert("Hubo un problema al eliminar la gira ❌");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (e: React.MouseEvent, overrides?: Record<string, string>) => {
    e.stopPropagation();
    if (!confirm("¿Deseas guardar los cambios?")) return;

    try {
      setEditing(true);
      const formData = new FormData();
      

      ["titulo", "descripcion", "anio"].forEach((key) => {
        const overrideVal = overrides && overrides[key];
        const value = overrideVal !== undefined ? overrideVal : editData[key as keyof Gira];
        if (typeof value === "string" && value.trim() !== "") {
          formData.append(key, value);
        }
      });

      // Añadir log de FormData
      try {
        Array.from(formData.entries());
      } catch (err) {
      }

      // Añadir descripción HTML si llegó como override
      if (overrides && overrides.descripcion_html) {
        formData.append('descripcion_html', overrides.descripcion_html);
      } else if ((editData as any).descripcion_html) {
        formData.append('descripcion_html', (editData as any).descripcion_html as string);
      }

      // Lugares
      if (Array.isArray(editData.lugares) && editData.lugares.length > 0) {
        editData.lugares.forEach((lugar) => {
          formData.append("lugares[]", lugar);
        });
      }

      // Videos existentes
      if (Array.isArray(editData.videos) && !removeVideos) {
        editData.videos.forEach((video) => {
          if (typeof video === "string" && video.startsWith("/uploads")) {
            formData.append("videosExistentes[]", video);
          }
        });
      }

      // Imágenes existentes
      if (Array.isArray(editData.imagenes) && !removeImagenes) {
        editData.imagenes.forEach((imagen) => {
          if (typeof imagen === "string" && imagen.startsWith("/uploads")) {
            formData.append("imagenesExistentes[]", imagen);
          }
        });
      }

      // Portada existente
      if (editData.portada && !removePortada && !selectedPortada) {
        formData.append("portadaExistente", editData.portada);
      }

      // Nuevos videos
      if (selectedVideos) {
        selectedVideos.forEach((file) => {
          formData.append("videos", file);
        });
      }

      // Nuevas imágenes
      if (selectedImagenes) {
        selectedImagenes.forEach((file) => {
          formData.append("imagenes", file);
        });
      }

      // Nueva portada
      if (selectedPortada) {
        formData.append("portada", selectedPortada);
      }

      // Flags para eliminar
      if (removeVideos) {
        formData.append("eliminarVideos", "true");
      }

      if (removeImagenes) {
        formData.append("eliminarImagenes", "true");
      }

      if (removePortada) {
        formData.append("eliminarPortada", "true");
      }

      const performPut = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/gira/${editData.id}`, {
            method: "PUT",
            body: formData,
            credentials: "include",
          });
          if (response.status === 401) {
            const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
              method: "GET",
              credentials: "include",
            });
            if (refresh.ok) {
              const retryResponse = await fetch(
                `${baseUrl}/api/gira/${editData.id}`,
                {
                  method: "PUT",
                  body: formData,
                  credentials: "include",
                }
              );
              if (!retryResponse.ok) {
                throw new Error("Error al actualizar la gira");
              }
              return retryResponse;
            }
          }
          if (!response.ok) {
            throw new Error("Error al actualizar la gira");
          }
          return response;
        } catch (error) {
          throw error;
        }
      };
      const res = await performPut();

      if (!res.ok) throw new Error("Error al actualizar la gira");

      alert("Gira actualizada correctamente ✅");
      onAdded?.();
      setEditOpen(false);
    } catch (error) {
      console.error("Error al actualizar la gira:", error);
      alert("Error al actualizar la gira ❌");
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="relative min-w-[350px] max-w-[350px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
        {/* Vista previa de multimedia */}
        <div className="mb-4">
          {/* Mostrar portada si existe */}
          {gira.portada && (
            <div className="mb-2">
              <img
                src={`${baseUrl}${gira.portada}`}
                alt="Portada"
                className="w-full h-32 rounded-lg object-cover"
              />
            </div>
          )}
          
          {/* Galería de videos e imágenes */}
          <div className="flex gap-2 overflow-x-auto">
            {/* Videos */}
            {Array.isArray(gira.videos) && gira.videos.length > 0 && 
              gira.videos.slice(0, 2).map((videoUrl, index) => (
                <video
                  key={`video-${index}`}
                  className="w-24 h-20 rounded flex-shrink-0 object-cover"
                  preload="metadata">
                  <source src={`${baseUrl}${videoUrl}`} type="video/mp4" />
                </video>
              ))
            }
            
            {/* Imágenes */}
            {Array.isArray(gira.imagenes) && gira.imagenes.length > 0 && 
              gira.imagenes.slice(0, 3).map((imagenUrl, index) => (
                <img
                  key={`imagen-${index}`}
                  src={`${baseUrl}${imagenUrl}`}
                  alt={`Imagen ${index + 1}`}
                  className="w-24 h-20 rounded flex-shrink-0 object-cover"
                />
              ))
            }
          </div>
          
          {/* Contador de multimedia */}
          <div className="mt-2 text-xs text-gray-600">
            {(gira.videos?.length || 0) + (gira.imagenes?.length || 0) > 0 ? (
              <span>
                {gira.videos?.length || 0} video{(gira.videos?.length || 0) !== 1 ? 's' : ''} • {gira.imagenes?.length || 0} imagen{(gira.imagenes?.length || 0) !== 1 ? 'es' : ''}
              </span>
            ) : (
              <span className="text-gray-400">Sin multimedia</span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg mb-1">{gira.titulo}</h3>
        <p className="text-sm text-gray-600 mb-2">{gira.anio}</p>

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

      <Modal_Gira gira={gira} isOpen={open} onClose={() => setOpen(false)} />
      <Modal_Edicion_Gira
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editData={editData}
        setEditData={setEditData}
        selectedVideos={selectedVideos}
        setSelectedVideos={setSelectedVideos}
        selectedImagenes={selectedImagenes}
        setSelectedImagenes={setSelectedImagenes}
        selectedPortada={selectedPortada}
        setSelectedPortada={setSelectedPortada}
        removeVideos={removeVideos}
        setRemoveVideos={setRemoveVideos}
        removeImagenes={removeImagenes}
        setRemoveImagenes={setRemoveImagenes}
        removePortada={removePortada}
        setRemovePortada={setRemovePortada}
        handleEdit={handleEdit}
        editing={editing}
      />
    </>
  );
}
