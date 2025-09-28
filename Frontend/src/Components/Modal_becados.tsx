import { createPortal } from "react-dom";

interface ModalBecadosProps {
  descripcion: string;

  isOpen: boolean;
  onClose: () => void;
}

export default function ModalBecados({
  isOpen,
  onClose,
}: ModalBecadosProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // 👈 click fuera cierra
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // 👈 evita que el click dentro cierre
      >
        {/* Contenido */}
        <div className="space-y-3 text-gray-700">
            <p><span className="font-semibold">Descripción:</span> Descripcion generica para todos:p</p>
        </div>

        {/* Botón */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
