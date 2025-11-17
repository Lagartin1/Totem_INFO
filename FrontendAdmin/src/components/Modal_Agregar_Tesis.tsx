import React from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Tesis({
  isOpen,
  closeModal,
  onAdded,
}: {
  isOpen: boolean;
  closeModal: () => void;
  onAdded: () => void;
}) {
  if (!isOpen) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tesisData = Object.fromEntries(formData.entries());

    const performPost = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tesis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
          },
          body: JSON.stringify(tesisData),
        });
        if (res.status === 401) {
          const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
            method: "GET",
            credentials: "include",
          });
          if (refresh.ok) {
            const retryResponse = await fetch(`${baseUrl}/api/tesis`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                credentials: "include",
              },
              body: JSON.stringify(tesisData),
            });
            if (!retryResponse.ok) {
              throw new Error("Error al guardar la tesis");
            }
            return retryResponse;
          }
        }
        if (!res.ok) {
          throw new Error("Error al guardar la tesis");
        }
        return res;
      } catch (error) {
        throw error;
      }
    };
    try {
      const res = await performPost();

      if (!res.ok) throw new Error("Error al guardar la tesis");

      alert("✅ Tesis agregada correctamente");
      closeModal();
      onAdded();
    } catch (error) {
      console.error("❌ Error al crear tesis:", error);
      alert("❌ Hubo un error al agregar la tesis");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/20 backdrop-blur-md transition-all duration-300"
      onClick={closeModal}>
      <div
        className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Agregar Nueva Tesis</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="titulo"
            type="text"
            placeholder="Título de la Tesis"
            className="border p-2 rounded"
            required
          />

          <input
            name="autor"
            type="text"
            placeholder="Autor(es) (separados por coma)"
            className="border p-2 rounded"
            required
          />

          <input
            name="profesor"
            type="text"
            placeholder="Profesor Guía"
            className="border p-2 rounded"
          />

          <input
            name="area_desarrollo"
            type="text"
            placeholder="Área de Desarrollo"
            className="border p-2 rounded"
          />

          <input
            name="fecha_publicacion"
            type="date"
            placeholder="Fecha de Publicación"
            className="border p-2 rounded"
          />

          <textarea
            name="resumen"
            placeholder="Resumen o Descripción"
            className="border p-2 rounded"
          />

          <input
            name="palabras_clave"
            type="text"
            placeholder="Palabras Clave (separadas por coma)"
            className="border p-2 rounded"
          />

          {/* Input de 'videos' eliminado */}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
