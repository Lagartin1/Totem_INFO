interface Noticia {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  autor: string;
  fecha_publicacion: string;
  imagen?: string;
}

interface EdicionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: Partial<Noticia>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Noticia>>>;
  handleEdit: (e: React.MouseEvent) => Promise<void>
  editing: boolean;
}

export default function EdicionModal({
  isOpen: open,
  onClose,
  editData,
  setEditData,
  handleEdit,
  editing,
}: EdicionModalProps) {

  if (!open) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Editar Noticia</h2>

            <input
              type="text"
              value={editData.titulo || ""}
              onChange={(e) =>
                setEditData({ ...editData, titulo: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
              placeholder="Título"
            />
            <textarea
              value={editData.descripcion || ""}
              onChange={(e) =>
                setEditData({ ...editData, descripcion: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
              placeholder="Descripción"
            />
            <textarea
              value={editData.contenido || ""}
              onChange={(e) =>
                setEditData({ ...editData, contenido: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
              placeholder="Contenido"
            />

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
      )}
    </>
  );
}
