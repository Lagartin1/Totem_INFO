import React, { useRef } from "react";
import type { Noticia } from "../types/index";
import type { OutputData } from '@editorjs/editorjs';
import EditorComponent from "./Editor";
import { blocksToHtml } from "../lib/renderEditorContent";
import type EditorJS from '@editorjs/editorjs';

interface EdicionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Noticia>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Noticia>>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  removeImage: boolean;
  setRemoveImage: React.Dispatch<React.SetStateAction<boolean>>;
  handleEdit: (e: React.MouseEvent, overrides?: Record<string, string>) => Promise<void>;
  editing: boolean;
}

export default function EdicionModal({
  isOpen: open,
  onClose,
  editData,
  setEditData,
  selectedFile,
  setSelectedFile,
  removeImage,
  setRemoveImage,
  handleEdit,
  editing,
}: EdicionModalProps) {
  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setRemoveImage(true);
  };

  const handleEditorChange = (data: OutputData) => {
    setEditData({ ...editData, contenido: JSON.stringify(data) });
  };

  const handleEditorHtmlChange = (html: string) => {
    setEditData((prev) => ({ ...(prev as any), contenido_html: html }));
  };

  const editorInstance = useRef<EditorJS | null>(null);

  const saveEditorThenHandleEdit = async (e: React.MouseEvent) => {
    // Intentar esperar brevemente a que la instancia del editor esté disponible
    let attempts = 0;
    while (!editorInstance.current && attempts < 10) {
      // esperar 50ms
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 50));
      attempts += 1;
    }

    if (editorInstance.current) {
      try {
        const saved = await editorInstance.current.save();
        const savedJson = JSON.stringify(saved);
        const savedHtml = blocksToHtml(saved);
        setEditData((prev) => ({ ...(prev as any), contenido: savedJson, contenido_html: savedHtml }));
        await handleEdit(e, { contenido: savedJson, contenido_html: savedHtml });
        return;
      } catch (err) {
        console.warn('No se pudo obtener contenido desde editor instance:', err);
      }
    }

    
    const fallbackContenido = editData.contenido ? String(editData.contenido) : '';
    const fallbackHtml = (editData as any).contenido_html ? String((editData as any).contenido_html) : '';
    await handleEdit(e, { contenido: fallbackContenido, contenido_html: fallbackHtml });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}>
      <form
        className="bg-white p-6 rounded-xl shadow-lg w-[400px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Editar Noticia</h2>

        <input
          type="text"
          value={editData.titulo || ""}
          onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Título"
        />

        <input
          type="text"
          value={editData.autor || ""}
          onChange={(e) => setEditData({ ...editData, autor: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Autor"
        />
        
        <div className="mb-4">
          <label className="block font-medium mb-1">Contenido:</label>
          <EditorComponent
            initialData={editData.contenido || ""}
            onChangeData={handleEditorChange}
            onChangeHtml={handleEditorHtmlChange}
            onReady={(ed) => (editorInstance.current = ed)}
          />
        </div>

        {/* Imagen */}
        <div className="mt-4">
          <label className="block font-medium mb-1">Imagen:</label>
          {(editData.imagen && !removeImage) || selectedFile ? (
            <div className="flex flex-col items-center border p-2 rounded">
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : editData.imagen
                }
                alt="Previsualización"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRemoveImage}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer text-blue-600 underline">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Subir imagen
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button
            onClick={saveEditorThenHandleEdit}
            disabled={editing}
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">
            {editing ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
