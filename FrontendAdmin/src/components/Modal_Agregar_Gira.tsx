import { useState, useRef } from "react";
import type { OutputData } from '@editorjs/editorjs';
import EditorComponent from "./Editor";
import { blocksToHtml } from "../lib/renderEditorContent";
import type EditorJS from '@editorjs/editorjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Gira({
  isOpen,
  closeModal,
  onAdded,
}: {
  isOpen: boolean;
  closeModal: () => void;
  onAdded: () => void;
}) {
  const [editorData, setEditorData] = useState<OutputData | null>(null);
  const [editorHtml, setEditorHtml] = useState<string>("");
  const editorInstance = useRef<EditorJS | null>(null);

  if (!isOpen) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Obtener contenido reciente desde la instancia si existe
    if (editorInstance.current) {
      try {
        const saved = await editorInstance.current.save();
        formData.set('descripcion', JSON.stringify(saved));
        formData.set('descripcion_html', blocksToHtml(saved));
      } catch (err) {
        console.warn('No se pudo obtener contenido desde editor instance:', err);
        if (editorData) {
          formData.set('descripcion', JSON.stringify(editorData));
        } else if (editorHtml) {
          formData.set('descripcion', editorHtml);
        }
        if (editorHtml) formData.set('descripcion_html', editorHtml);
      }
    } else {
      // Adjuntar contenido del editor
      if (editorData) {
        formData.set('descripcion', JSON.stringify(editorData));
      } else if (editorHtml) {
        formData.set('descripcion', editorHtml);
      }
      if (editorHtml) formData.set('descripcion_html', editorHtml);
    }
    const performPost = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/gira`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (res.status === 401) {
          const refresh = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
            method: "GET",
            credentials: "include",
          });
          if (refresh.ok) {
            const retryResponse = await fetch(`${baseUrl}/api/gira`, {
              method: "POST",
              body: formData,
              credentials: "include",
            });
            if (!retryResponse.ok) {
              throw new Error("Error al guardar la gira");
            }
            return retryResponse;
          }
        }
        if (!res.ok) {
          throw new Error("Error al guardar la gira");
        }
        return res;
      } catch (error) {
        throw error;
      }
    };
    // Adjuntar contenido del editor
    if (editorData) {
      formData.set('descripcion', JSON.stringify(editorData));
    } else if (editorHtml) {
      formData.set('descripcion', editorHtml);
    }
    if (editorHtml) formData.set('descripcion_html', editorHtml);

    try {
      const res = await performPost();

      if (!res.ok) throw new Error("Error al guardar la gira");

      alert("✅ Gira agregada correctamente");
      closeModal();
      onAdded();
    } catch (error) {
      console.error("❌ Error al crear gira:", error);
      alert("❌ Hubo un error al agregar la gira");
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/20 backdrop-blur-md transition-all duration-300"
      onClick={closeModal}>
      <div
        className="bg-white p-6 rounded-lg w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Agregar Nueva Gira</h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          encType="multipart/form-data">
          <input
            name="titulo"
            type="text"
            placeholder="Título"
            className="border p-2 rounded"
            required
          />

          <div>
            <label className="block font-medium mb-1">Descripción:</label>
            <EditorComponent
              initialData={undefined}
              onChangeData={(d: OutputData) => setEditorData(d)}
              onChangeHtml={(h: string) => setEditorHtml(h)}
              onReady={(ed) => (editorInstance.current = ed)}
            />
          </div>

          <input
            name="anio"
            type="text"
            placeholder="Año"
            className="border p-2 rounded"
          />

          <label className="text-sm text-gray-600">Imagen de Portada</label>
          <input
            name="portada"
            type="file"
            accept="image/*"
            className="border p-2 rounded"
          />

          <label className="text-sm text-gray-600">
            Videos (puedes subir varios)
          </label>
          <input
            name="videos"
            type="file"
            accept="video/*"
            multiple
            className="border p-2 rounded"
          />

          <label className="text-sm text-gray-600">
            Imágenes (puedes subir varias)
          </label>
          <input
            name="imagenes"
            type="file"
            accept="image/*"
            multiple
            className="border p-2 rounded"
          />

          <label className="text-sm text-gray-600">
            Lugares visitados (separados por comas)
          </label>
          <input
            name="lugares"
            type="text"
            placeholder="Lugar 1, Lugar 2, Lugar 3"
            className="border p-2 rounded"
          />

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
