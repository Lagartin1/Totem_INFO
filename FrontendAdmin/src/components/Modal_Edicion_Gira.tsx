import React, { useRef } from "react";
import type { Gira } from "../types/index";
import { createPortal } from "react-dom";
import EditorComponent from "./Editor";
import { blocksToHtml } from "../lib/renderEditorContent";
import type EditorJS from '@editorjs/editorjs';

interface EdicionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Gira>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Gira>>>;
  selectedVideos: File[] | null;
  setSelectedVideos: React.Dispatch<React.SetStateAction<File[] | null>>;
  selectedImagenes: File[] | null;
  setSelectedImagenes: React.Dispatch<React.SetStateAction<File[] | null>>;
  selectedPortada: File | null;
  setSelectedPortada: React.Dispatch<React.SetStateAction<File | null>>;
  removeVideos: boolean;
  setRemoveVideos: React.Dispatch<React.SetStateAction<boolean>>;
  removeImagenes: boolean;
  setRemoveImagenes: React.Dispatch<React.SetStateAction<boolean>>;
  removePortada: boolean;
  setRemovePortada: React.Dispatch<React.SetStateAction<boolean>>;
  handleEdit: (e: React.MouseEvent, overrides?: Record<string, string>) => Promise<void>;
  editing: boolean;
}

export default function Modal_Edicion_Gira({
  isOpen: open,
  onClose,
  editData,
  setEditData,
  selectedVideos,
  setSelectedVideos,
  selectedImagenes,
  setSelectedImagenes,
  selectedPortada,
  setSelectedPortada,
  removeVideos,
  setRemoveVideos,
  removeImagenes,
  setRemoveImagenes,
  removePortada,
  setRemovePortada,
  handleEdit,
  editing,
}: EdicionModalProps) {
  if (!open) return null;

  const baseUrl = import.meta.env.VITE_BUILD_MODE ? import.meta.env.VITE_API_BASE_URL : "http://localhost:3000";

  const editorInstance = useRef<EditorJS | null>(null);

  const saveEditorThenHandleEdit = async (e: React.MouseEvent) => {
    // Esperar un poco a que la instancia del editor esté disponible
    let attempts = 0;
    while (!editorInstance.current && attempts < 10) {
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
    
    const fallbackContenido = (editData as any).descripcion ? String((editData as any).descripcion) : '';
    const fallbackHtml = (editData as any).descripcion_html ? String((editData as any).descripcion_html) : '';
    await handleEdit(e, { contenido: fallbackContenido, contenido_html: fallbackHtml });
  };

  // Manejo de videos
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedVideos(files.length > 0 ? files : null);
    setRemoveVideos(false);
  };

  const handleRemoveVideos = () => {
    setSelectedVideos(null);
    setRemoveVideos(true);
    // Limpiar los videos del estado de edición para que desaparezcan visualmente
    setEditData({ ...editData, videos: [] });
  };

  // Manejo de imágenes
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImagenes(files.length > 0 ? files : null);
    setRemoveImagenes(false);
  };

  const handleRemoveImagenes = () => {
    setSelectedImagenes(null);
    setRemoveImagenes(true);
    // Limpiar las imágenes del estado de edición para que desaparezcan visualmente
    setEditData({ ...editData, imagenes: [] });
  };

  // Manejo de portada
  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedPortada(file);
    setRemovePortada(false);
  };

  const handleRemovePortada = () => {
    setSelectedPortada(null);
    setRemovePortada(true);
    // Limpiar la portada del estado de edición para que desaparezca visualmente
    setEditData({ ...editData, portada: "" });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}>
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Editar Gira</h2>

        {/* Título */}
        <input
          type="text"
          value={editData.titulo || ""}
          onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Título de la gira"
        />

        {/* Descripción */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Descripción:</label>
          <EditorComponent
            initialData={editData.descripcion || ""}
            onChangeData={(d) => setEditData((prev) => ({ ...(prev as any), descripcion: JSON.stringify(d) }))}
            onChangeHtml={(h) => setEditData((prev) => ({ ...(prev as any), descripcion_html: h }))}
            onReady={(ed) => (editorInstance.current = ed)}
          />
        </div>

        {/* Año */}
        <input
          type="text"
          value={editData.anio || ""}
          onChange={(e) => setEditData({ ...editData, anio: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Año"
        />

        {/* Lugares */}
        <input
          type="text"
          value={editData.lugares?.join(", ") || ""}
          onChange={(e) => 
            setEditData({ 
              ...editData, 
              lugares: e.target.value.split(",").map(lugar => lugar.trim()).filter(lugar => lugar !== "")
            })
          }
          className="border p-2 w-full mb-4 rounded"
          placeholder="Lugares visitados (separados por comas)"
        />

        {/* Portada */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Portada:</label>
          {(editData.portada && !removePortada) || selectedPortada ? (
            <div className="flex flex-col gap-2">
              <img
                src={selectedPortada ? URL.createObjectURL(selectedPortada) : `${baseUrl}${editData.portada}`}
                alt="Portada"
                className="w-full h-48 rounded object-cover"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRemovePortada}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex-1">
                  Eliminar portada
                </button>
                <label className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer flex-1 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortadaChange}
                    className="hidden"
                  />
                  Cambiar portada
                </label>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer text-blue-600 underline">
              <input
                type="file"
                accept="image/*"
                onChange={handlePortadaChange}
                className="hidden"
              />
              Subir portada
            </label>
          )}
        </div>

        {/* Videos */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Videos:</label>
          {(editData.videos && editData.videos.length > 0 && !removeVideos) ||
          (selectedVideos && selectedVideos.length > 0) ? (
            <div className="flex flex-col gap-2">
              {(selectedVideos && selectedVideos.length > 0
                ? selectedVideos.map((file) => URL.createObjectURL(file))
                : editData.videos || []
              ).map((videoSrc, idx) => (
                <video
                  key={idx}
                  src={videoSrc.startsWith("blob:") ? videoSrc : `${baseUrl}${videoSrc}`}
                  controls
                  className="w-full h-40 rounded bg-black"
                />
              ))}
              <button
                onClick={handleRemoveVideos}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Eliminar todos los videos
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer text-blue-600 underline">
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="hidden"
              />
              Subir videos
            </label>
          )}
        </div>

        {/* Imágenes */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Imágenes:</label>
          {(editData.imagenes && editData.imagenes.length > 0 && !removeImagenes) ||
          (selectedImagenes && selectedImagenes.length > 0) ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {(selectedImagenes && selectedImagenes.length > 0
                  ? selectedImagenes.map((file) => URL.createObjectURL(file))
                  : editData.imagenes || []
                ).map((imagenSrc, idx) => (
                  <img
                    key={idx}
                    src={imagenSrc.startsWith("blob:") ? imagenSrc : `${baseUrl}${imagenSrc}`}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-32 rounded object-cover"
                  />
                ))}
              </div>
              <button
                onClick={handleRemoveImagenes}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Eliminar todas las imágenes
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer text-blue-600 underline">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagenChange}
                className="hidden"
              />
              Subir imágenes
            </label>
          )}
        </div>

        {/* Botones */}
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
      </div>
    </div>,
    document.body
  );
}
