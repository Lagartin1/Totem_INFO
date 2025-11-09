const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Noticias({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  if (!isOpen) return null;

  // Si estás en desarrollo usa localhost, si estás en producción usa la variable del servidor
  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${baseUrl}/api/noticias`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al guardar noticia");

      alert("✅ Noticia agregada correctamente");
      closeModal();
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

          <textarea
            name="contenido"
            placeholder="Contenido"
            className="border p-2 rounded"
            required
          />

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
