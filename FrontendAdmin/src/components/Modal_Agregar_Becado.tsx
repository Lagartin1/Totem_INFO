const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Becado({
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const performPost = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/becados`, {
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
            const retryResponse = await fetch(`${baseUrl}/api/becados`, {
              method: "POST",
              body: formData,
              credentials: "include",
            });
            if (!retryResponse.ok) {
              throw new Error("Error al guardar becado");
            }
            return retryResponse;
          }
        }
        if (!res.ok) {
          throw new Error("Error al guardar becado");
        }
        return res;
      } catch (error) {
        throw error;
      }
    };
    try {
      const res = await performPost();

      if (!res.ok) throw new Error("Error al guardar becado");

      alert("✅ Becado agregado correctamente");
      closeModal();
      onAdded();
    } catch (error) {
      console.error("❌ Error al crear becado:", error);
      alert("❌ Hubo un error al agregar el becado");
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
        <h3 className="text-xl font-semibold mb-4">Agregar Nuevo Becado</h3>

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

          <textarea
            name="descripcion"
            placeholder="Descripción"
            className="border p-2 rounded"
            required
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
