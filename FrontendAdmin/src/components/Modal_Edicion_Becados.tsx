import React from "react";
import type { Becado } from "../types/index";
import { createPortal } from "react-dom";

interface EdicionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Becado>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Becado>>>;
  selectedVideos: File[] | null;
  setSelectedVideos: React.Dispatch<React.SetStateAction<File[] | null>>;
  selectedImages: File[] | null;
  setSelectedImages: React.Dispatch<React.SetStateAction<File[] | null>>;
  selectedPortada: File | null;
  setSelectedPortada: React.Dispatch<React.SetStateAction<File | null>>;
  removeVideos: boolean;
  setRemoveVideos: React.Dispatch<React.SetStateAction<boolean>>;
  removeImages: boolean;
  setRemoveImages: React.Dispatch<React.SetStateAction<boolean>>;
  removePortada: boolean;
  setRemovePortada: React.Dispatch<React.SetStateAction<boolean>>;
  handleEdit: (e: React.MouseEvent) => Promise<void>;
  editing: boolean;
}

export default function Modal_Edicion_Becados({
  isOpen: open,
  onClose,
  editData,
  setEditData,
  selectedVideos,
  setSelectedVideos,
  selectedImages,
  setSelectedImages,
  selectedPortada,
  setSelectedPortada,
  removeVideos,
  setRemoveVideos,
  removeImages,
  setRemoveImages,
  removePortada,
  setRemovePortada,
  handleEdit,
  editing,
}: EdicionModalProps) {
  if (!open) return null;

  // Manejo de videos
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedVideos(files.length > 0 ? files : null);
    setRemoveVideos(false);
  };

  const handleRemoveVideos = () => {
    setSelectedVideos(null);
    setRemoveVideos(true);
  };

  // Manejo de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files.length > 0 ? files : null);
    setRemoveImages(false);
  };

  const handleRemoveImages = () => {
    setSelectedImages(null);
    setRemoveImages(true);
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
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}>
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Editar Becado</h2>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Nombre del becado:</label>
          <input
            type="text"
            value={editData.nombre || ""}
            onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
            className="border p-2 w-full rounded"
            placeholder="Nombre del becado"
          />
        </div>

        {/* Título */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Título:</label>
          <input
            type="text"
            value={editData.titulo || ""}
            onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
            className="border p-2 w-full rounded"
            placeholder="Título del proyecto"
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Descripción:</label>
          <textarea
            value={editData.descripcion || ""}
            onChange={(e) =>
              setEditData({ ...editData, descripcion: e.target.value })
            }
            className="border p-2 w-full rounded min-h-[100px]"
            placeholder="Descripción"
          />
        </div>

        {/* Fecha de publicación */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Fecha de publicación:</label>
          <input
            type="date"
            value={editData.fecha_publicacion || ""}
            onChange={(e) => setEditData({ ...editData, fecha_publicacion: e.target.value })}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Portada */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Portada:</label>
          {(editData.portada && !removePortada) || selectedPortada ? (
            <div className="flex flex-col gap-2">
              <img
                src={selectedPortada ? URL.createObjectURL(selectedPortada) : editData.portada}
                alt="Portada"
                className="w-full h-40 object-cover rounded"
              />
              <button
                onClick={handleRemovePortada}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Eliminar portada
              </button>
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

        {/* Imágenes */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Imágenes:</label>
          {(editData.imagenes && editData.imagenes.length > 0 && !removeImages) ||
          (selectedImages && selectedImages.length > 0) ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {(selectedImages && selectedImages.length > 0
                  ? selectedImages.map((file) => URL.createObjectURL(file))
                  : editData.imagenes || []
                ).map((imgSrc, idx) => (
                  <img
                    key={idx}
                    src={imgSrc}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
              <button
                onClick={handleRemoveImages}
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
                onChange={handleImageChange}
                className="hidden"
              />
              Subir imágenes
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
                  src={videoSrc}
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

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button
            onClick={handleEdit}
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
