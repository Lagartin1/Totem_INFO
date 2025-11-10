import { useState } from "react";
import type { Proyecto } from "../types/index";
import Modal_Proyectos from "./Modal_Proyectos";
import Modal_Edicion_Proyecto from "./Modal_Edicion_Proyecto";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardProyectosProps {
  proyecto: Proyecto;
  onDelete?: (id: string) => void;
}

export default function Card_Proyectos({
  proyecto,
  onDelete,
}: CardProyectosProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Proyecto>>(proyecto);
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [removeVideos, setRemoveVideos] = useState(false);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmar = confirm("¿Seguro que quieres eliminar este proyecto?");
    if (!confirmar) return;

    try {
      setDeleting(true);
      const res = await fetch(`${baseUrl}/api/proyectos/${proyecto.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el proyecto");
      }

      alert("Proyecto eliminado correctamente ✅");
      onDelete?.(proyecto.id);
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert("Hubo un problema al eliminar el proyecto ❌");
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

      // Campos de texto simples
      [
        "titulo",
        "descripcion",
        "fecha_publicacion",
        "telefono_contacto",
        "correo_contacto",
        "area_desarrollo",
      ].forEach((key) => {
        const value = editData[key as keyof Proyecto];
        if (typeof value === "string" && value.trim() !== "") {
          formData.append(key, value);
        }
      });

      // Autores (puede ser string o string[])
      if (editData.autores) {
        if (Array.isArray(editData.autores)) {
          editData.autores.forEach((autor) =>
            formData.append("autores[]", autor)
          );
        } else if (typeof editData.autores === "string") {
          formData.append("autores[]", editData.autores);
        }
      }

      // Videos (array de strings o archivos)
      if (Array.isArray(editData.videos)) {
        editData.videos.forEach((video) => {
          // Si ya es una URL, la enviamos como texto
          if (typeof video === "string" && video.startsWith("/uploads")) {
            formData.append("videos[]", video);
          }
        });
      }

      // Si hay nuevos archivos seleccionados (por ejemplo en un input multiple)
      if (selectedFile) {
        selectedFile.forEach((file) => {
          formData.append("videos[]", file);
        });
      }

      if (removeVideos) {
        formData.append("eliminarVideos", "true");
      }

      const res = await fetch(`${baseUrl}/api/proyectos/${editData.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al actualizar el proyecto");

      alert("Proyecto actualizado correctamente ✅");
      setEditOpen(false);
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      alert("Error al actualizar el proyecto ❌");
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="relative min-w-[350px] max-w-[350px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
        {/* Galería de videos */}
        {Array.isArray(proyecto.videos) && proyecto.videos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto mb-4">
            {proyecto.videos.map((videoUrl, index) => (
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

        <h3 className="font-bold text-lg mb-1">{proyecto.titulo}</h3>
        <p className="text-gray-600 text-sm">{proyecto.autores}</p>
        <p className="text-gray-500 text-sm mb-4">{proyecto.area_desarrollo}</p>
        <p className="text-gray-500 text-sm mb-4">
          {proyecto.correo_contacto} | {proyecto.telefono_contacto}
        </p>

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

      <Modal_Proyectos
        proyecto={proyecto}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <Modal_Edicion_Proyecto
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
