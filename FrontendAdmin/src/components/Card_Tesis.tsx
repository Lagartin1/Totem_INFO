import { useState } from "react";
// Importamos el tipo Tesis desde tu modelo
import type { Tesis } from "../types/index";
import Modal_Tesis from "./Modal_Tesis"; 
import Modal_Edicion_Tesis from "./Modal_Edicion_Tesis";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CardTesisProps {
  tesis: Tesis;
  onDelete?: (id: string) => void;
  onAdded?: () => void;
}

export default function Card_Tesis({
  tesis,
  onDelete,
  onAdded,
}: CardTesisProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Tesis>>(tesis);

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // NOTA: Reemplacé 'confirm' y 'alert' por 'window.confirm' y 'window.alert'
    // para asegurar compatibilidad, aunque idealmente usarías un modal de UI
    const confirmar = window.confirm("¿Seguro que quieres eliminar esta tesis?");
    if (!confirmar) return;

    const performDelete = async () => {
      try {
        // 1. Cambiamos la ruta a la API de tesis
        const response = await fetch(`${baseUrl}/api/tesis/${tesis.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.status === 401) {
          const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
            method: "GET",
            credentials: "include",
          });
          if (refresh.ok) {
            const retryResponse = await fetch(`${baseUrl}/api/tesis/${tesis.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            if (!retryResponse.ok) {
              throw new Error("Error al eliminar la tesis");
            }
            return retryResponse;
          }
        }
        if (!response.ok) {
          throw new Error("Error al eliminar la tesis");
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    try {
      setDeleting(true);
      await performDelete();
      window.alert("Tesis eliminada correctamente ✅");
      onDelete?.(tesis.id);
    } catch (error) {
      console.error("Error al eliminar tesis:", error);
      window.alert("Hubo un problema al eliminar la tesis ❌");
    } finally {
      setDeleting(false);
    }
  };

  // 2. Lógica de edición REFACTORIZADA para enviar JSON (no FormData)
  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Deseas guardar los cambios?")) return;

    try {
      setEditing(true);

      const performPut = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/tesis/${editData.id}`, {
            method: "PUT",
            // Enviamos JSON porque no hay archivos
            headers: {
              "Content-Type": "application/json",
              credentials: "include",
            },
            body: JSON.stringify(editData), // Enviamos el estado de edición
          });
          if (response.status === 401) {
            const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
              method: "GET",
              credentials: "include",
            });
            if (refresh.ok) {
              const retryResponse = await fetch(`${baseUrl}/api/tesis/${editData.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  credentials: "include",
                },
                body: JSON.stringify(editData),
              });
              if (!retryResponse.ok) {
                throw new Error("Error al actualizar la tesis");
              }
              return retryResponse;
            }
          }
          if (!response.ok) {
            throw new Error("Error al actualizar la tesis");
          }
          return response;
        } catch (error) {
          throw error;
        }
      };

      const res = await performPut();

      if (!res.ok) throw new Error("Error al actualizar la tesis");

      window.alert("Tesis actualizada correctamente ✅");
      onAdded?.();
      setEditOpen(false);
    } catch (error) {
      console.error("Error al actualizar tesis:", error);
      window.alert("Error al actualizar la tesis ❌");
    } finally {
      setEditing(false);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="relative min-w-[350px] max-w-[350px] border rounded-xl shadow-sm p-4 flex flex-col flex-shrink-0 snap-center bg-white">
        
        {/* 3. Reemplazamos la galería de videos por un ícono y un resumen */}
        <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
          {/* Ícono de documento */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5a3.375 3.375 0 0 0-3.375 3.375v2.625m5.25 0v-4.875c0-.621-.504-1.125-1.125-1.125H9.75c-.621 0-1.125.504-1.125 1.125v4.875m0 0a3.375 3.375 0 0 0 3.375 3.375h1.5a3.375 3.375 0 0 0 3.375-3.375Z" />
          </svg>
        </div>

        {/* 4. Usamos los campos de 'tesis' (title, autor, etc.) */}
        <h3 className="font-bold text-lg mb-1">{tesis.titulo}</h3>
        <p className="text-gray-600 text-sm">{tesis.autor || "Sin autor"}</p>
        <p className="text-gray-500 text-sm mb-4">{tesis.area_desarrollo || "Sin área"}</p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 h-[60px]">
          {tesis.resumen || tesis.descripcion || "No hay resumen disponible."}
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

      {/* 5. Apuntamos a los Modales de Tesis */}
      <Modal_Tesis
        tesis={tesis}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <Modal_Edicion_Tesis
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