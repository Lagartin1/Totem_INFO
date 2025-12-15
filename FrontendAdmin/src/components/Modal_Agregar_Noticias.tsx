import { useState, useRef } from "react";
import type { OutputData } from '@editorjs/editorjs';
import EditorComponent from "./Editor";
import { blocksToHtml } from "../lib/renderEditorContent";
import type EditorJS from '@editorjs/editorjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Noticias({
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

    // Si tenemos la instancia del editor, obtener el contenido más reciente directamente
    if (editorInstance.current) {
      try {
        const saved = await editorInstance.current.save();
        formData.set('contenido', JSON.stringify(saved));
        formData.set('contenido_html', blocksToHtml(saved));
      } catch (err) {
        console.warn('No se pudo obtener contenido desde editor instance:', err);
        // fallback a estado
        if (editorData) {
          formData.set('contenido', JSON.stringify(editorData));
        } else if (editorHtml) {
          formData.set('contenido', editorHtml);
        }
        if (editorHtml) formData.set('contenido_html', editorHtml);
      }
    } else {
      // Adjuntar contenido del editor: JSON y HTML para vistas previas
      if (editorData) {
        formData.set('contenido', JSON.stringify(editorData));
      } else if (editorHtml) {
        // fallback si no hay JSON
        formData.set('contenido', editorHtml);
      }
      if (editorHtml) formData.set('contenido_html', editorHtml);
    }

    const perferomPost = async () => {
      const res = await fetch(`${baseUrl}/api/noticias`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      console.log("Respuesta del servidor:", res.status);
      if (res.status === 401) {
        const refreshRes = await fetch(`${baseUrl}/api/admin/auth/refresh`, {
          method: "GET",
          credentials: "include",
        });
        if (refreshRes.ok) {
          const retryRes = await fetch(`${baseUrl}/api/noticias`, {
            method: "POST",
            credentials: "include",
            body: formData,
          });
          return retryRes;
        } else {
          throw new Error("No autorizado");
        }
      }
      return res;
    };

    try {
      const res = await perferomPost();

      if (!res.ok) throw new Error("Error al guardar noticia");

      alert("✅ Noticia agregada correctamente");
      closeModal();
      onAdded();
    } catch (error) {
      console.error("❌ Error al crear noticia:", error);
      alert("❌ Hubo un error al agregar la noticia");
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/20 backdrop-blur-md
        transition-all duration-300"
      onClick={closeModal}>
      <div
        className="bg-white p-6 rounded-lg w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Agregar Nueva Noticia</h3>

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

          <input
            name="autor"
            type="text"
            placeholder="Autor"
            className="border p-2 rounded"
          />

          <div>
            <label className="block font-medium mb-1">Contenido:</label>
            <div className="border p-2 rounded max-h-60 overflow-auto">
              <EditorComponent
                initialData={undefined}
                onChangeData={(d: OutputData) => setEditorData(d)}
                onChangeHtml={(h: string) => setEditorHtml(h)}
                onReady={(ed) => (editorInstance.current = ed)}
              />
            </div>
          </div>

          <label className="text-sm text-gray-600">Imagen (opcional)</label>
          <input
            name="imagen"
            type="file"
            accept="image/*"
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
