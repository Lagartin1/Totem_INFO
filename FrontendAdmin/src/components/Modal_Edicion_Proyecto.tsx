import React from "react";
import type { Proyecto } from "../types/index";
import { createPortal } from "react-dom";

interface EdicionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Proyecto>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Proyecto>>>;
  selectedVideos: File[] | null;
  setSelectedVideos: React.Dispatch<React.SetStateAction<File[] | null>>;
  removeVideos: boolean;
  setRemoveVideos: React.Dispatch<React.SetStateAction<boolean>>;
  handleEdit: (e: React.MouseEvent) => Promise<void>;
  editing: boolean;
}

export default function Modal_Edicion_Proyecto({
  isOpen: open,
  onClose,
  editData,
  setEditData,
  selectedVideos,
  setSelectedVideos,
  removeVideos,
  setRemoveVideos,
  handleEdit,
  editing,
}: EdicionModalProps) {
  if (!open) return null;

  // Manejar autores dinámicos
  const handleAutorChange = (index: number, value: string) => {
    const nuevosAutores = [...(Array.isArray(editData.autores) ? editData.autores : [])];
    nuevosAutores[index] = value;
    setEditData({ ...editData, autores: nuevosAutores });
  };

  const handleAgregarAutor = () => {
    setEditData({
      ...editData,
      autores: [...(Array.isArray(editData.autores) ? editData.autores : []), ""],
    });
  };

  const handleEliminarAutor = (index: number) => {
    const nuevosAutores = (Array.isArray(editData.autores) ? editData.autores : []).filter(
      (_, i) => i !== index
    );
    setEditData({ ...editData, autores: nuevosAutores });
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
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-[450px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Editar Proyecto</h2>

        {/* Título */}
        <input
          type="text"
          value={editData.titulo || ""}
          onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Título del proyecto"
        />

        {/* Descripción */}
        <textarea
          value={editData.descripcion || ""}
          onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
          className="border p-2 w-full mb-2 rounded min-h-[100px]"
          placeholder="Descripción"
        />

        {/* Autores */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Autores:</label>
          {Array.isArray(editData.autores) && editData.autores.length > 0 ? (
            editData.autores.map((autor, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => handleAutorChange(index, e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder={`Autor ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleEliminarAutor(index)}
                  className="px-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mb-2">No hay autores disponibles</p>
          )}

          <button
            type="button"
            onClick={handleAgregarAutor}
            className="text-blue-500 text-sm hover:underline"
          >
            + Agregar autor
          </button>
        </div>

        {/* Contacto */}
        <input
          type="email"
          value={editData.correo_contacto || ""}
          onChange={(e) => setEditData({ ...editData, correo_contacto: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Correo de contacto"
        />

        <input
          type="tel"
          value={editData.telefono_contacto || ""}
          onChange={(e) => setEditData({ ...editData, telefono_contacto: e.target.value })}
          className="border p-2 w-full mb-2 rounded"
          placeholder="Teléfono de contacto"
        />

        {/* Área de desarrollo */}
        <input
          type="text"
          value={editData.area_desarrollo || ""}
          onChange={(e) => setEditData({ ...editData, area_desarrollo: e.target.value })}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Área de desarrollo"
        />

        {/* Videos */}
        <div className="mt-4">
          <label className="block font-medium mb-1">Videos:</label>
          {((editData.videos && editData.videos.length > 0 && !removeVideos) ||
          (selectedVideos && selectedVideos.length > 0)) ? (
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
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
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
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleEdit}
            disabled={editing}
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {editing ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
