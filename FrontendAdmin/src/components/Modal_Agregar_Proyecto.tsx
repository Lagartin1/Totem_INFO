import { useState, useRef } from "react";
import type { OutputData } from '@editorjs/editorjs';
import EditorComponent from "./Editor";
import { blocksToHtml } from "../lib/renderEditorContent";
import type EditorJS from '@editorjs/editorjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Proyecto({
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
  const [autores, setAutores] = useState<string[]>([""]);
  const [editorData, setEditorData] = useState<OutputData | null>(null);
  const [editorHtml, setEditorHtml] = useState<string>("");
  const editorInstance = useRef<EditorJS | null>(null);

  const handleAddAutor = () => setAutores([...autores, ""]);
  const handleChangeAutor = (index: number, value: string) => {
    const nuevos = [...autores];
    nuevos[index] = value;
    setAutores(nuevos);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Obtener contenido reciente desde la instancia si existe
    if (editorInstance.current) {
      try {
        const saved = await editorInstance.current.save();
        console.log('Modal_Agregar: Editor saved:', saved);
        // Guardamos JSON del editor para poder editarlo después
        formData.set('descripcion', JSON.stringify(saved));
        // Pero también guardamos HTML puro sin etiquetas wrapper para mostrar
        formData.set('descripcion_html', blocksToHtml(saved));
      } catch (err) {
        console.warn('No se pudo obtener contenido desde editor instance:', err);
        if (editorHtml) {
          formData.set('descripcion', editorHtml);
          formData.set('descripcion_html', editorHtml);
        } else if (editorData) {
          const html = blocksToHtml(editorData) || "";
          formData.set('descripcion', JSON.stringify(editorData));
          formData.set('descripcion_html', html);
        }
      }
    } else {
      if (editorHtml) {
        formData.set('descripcion', editorHtml);
        formData.set('descripcion_html', editorHtml);
      } else if (editorData) {
        const html = blocksToHtml(editorData) || "";
        formData.set('descripcion', JSON.stringify(editorData));
        formData.set('descripcion_html', html);
      }
    }

    autores.forEach((autor) => {
      if (autor.trim() !== "") formData.append("autor", autor);
    });

    const performPost = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/proyectos`, {
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
            const retryResponse = await fetch(`${baseUrl}/api/proyectos`, {
              method: "POST",
              body: formData,
              credentials: "include",
            });
            if (!retryResponse.ok) {
              throw new Error("Error al guardar proyecto");
            }
            return retryResponse;
          }
        }
        if (!res.ok) {
          throw new Error("Error al guardar proyecto");
        }
        return res;
      } catch (error) {
        throw error;
      }
    };
    try {
      const res = await performPost();

      if (!res.ok) throw new Error("Error al guardar proyecto");

      alert("✅ Proyecto agregado correctamente");
      closeModal();
      onAdded();
    } catch (error) {
      console.error("❌ Error al crear proyecto:", error);
      alert("❌ Hubo un error al agregar el proyecto");
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
        <h3 className="text-xl font-semibold mb-4">Agregar Nuevo Proyecto</h3>

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
            <div className="border p-2 rounded max-h-60 overflow-auto">
              <EditorComponent
                initialData={undefined}
                onChangeData={(d: OutputData) => setEditorData(d)}
                onChangeHtml={(h: string) => setEditorHtml(h)}
                onReady={(ed) => (editorInstance.current = ed)}
              />
            </div>
          </div>

          <label className="text-sm text-gray-600">Autores</label>
          {autores.map((autor, index) => (
            <input
              key={index}
              type="text"
              value={autor}
              onChange={(e) => handleChangeAutor(index, e.target.value)}
              placeholder={`Autor ${index + 1}`}
              className="border p-2 rounded"
              name={`autor_${index}`}
            />
          ))}

          <button
            type="button"
            onClick={handleAddAutor}
            className="text-blue-600 text-sm underline w-fit">
            + Añadir otro autor
          </button>

          <input
            name="telefono_contacto"
            type="tel"
            placeholder="Teléfono de contacto"
            className="border p-2 rounded"
          />

          <input
            name="correo_contacto"
            type="email"
            placeholder="Correo de contacto"
            className="border p-2 rounded"
          />

          <input
            name="area_desarrollo"
            type="text"
            placeholder="Área de desarrollo"
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
