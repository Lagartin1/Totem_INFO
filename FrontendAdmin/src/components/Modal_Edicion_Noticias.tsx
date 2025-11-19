import React from "react";
import type { Noticia } from "../types/index";

interface EdicionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Noticia>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Noticia>>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  removeImage: boolean;
  setRemoveImage: React.Dispatch<React.SetStateAction<boolean>>;
  handleEdit: (e: React.MouseEvent) => Promise<void>;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}>
      <div
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

        <textarea
          value={editData.contenido || ""}
          onChange={(e) =>
            setEditData({ ...editData, contenido: e.target.value })
          }
          className="border p-2 w-full mb-2 rounded min-h-[120px]"
          placeholder="Contenido"
        />

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
            onClick={handleEdit}
            disabled={editing}
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">
            {editing ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
