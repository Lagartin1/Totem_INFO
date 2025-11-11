import type { Tesis } from "../types/index";

interface ModalEdicionTesisProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Tesis>;
  setEditData: (data: Partial<Tesis>) => void;
  handleEdit: (e: React.MouseEvent) => void;
  editing: boolean;
}

/**
 * Placeholder para el Modal de edición de Tesis.
 * Necesitarás adaptar el código de tu Modal_Edicion_Proyecto aquí.
 */
export default function Modal_Edicion_Tesis({
  isOpen,
  onClose,
  editData,
  setEditData,
  handleEdit,
  editing
}: ModalEdicionTesisProps) {
  if (!isOpen) {
    return null;
  }

  // Ejemplo de un campo de edición
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg w-1/2" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Editando Tesis: {editData.title}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            name="title"
            value={editData.title || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Autor</label>
          <input
            type="text"
            name="autor"
            value={editData.autor || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleEdit}
            disabled={editing}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {editing ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}