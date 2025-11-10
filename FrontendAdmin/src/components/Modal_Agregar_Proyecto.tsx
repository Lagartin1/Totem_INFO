import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

export default function Modal_Agregar_Proyecto({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  if (!isOpen) return null;

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  // Estado para manejar múltiples autores
  const [autores, setAutores] = useState<string[]>([""]);

  const handleAddAutor = () => {
    setAutores([...autores, ""]);
  };

  const handleChangeAutor = (index: number, value: string) => {
    const nuevos = [...autores];
    nuevos[index] = value;
    setAutores(nuevos);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Agregar los autores manualmente al FormData
    autores.forEach((autor) => {
      if (autor.trim() !== "") formData.append("autor", autor);
    });

    try {
      const res = await fetch(`${baseUrl}/api/proyectos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al guardar proyecto");

      alert("✅ Proyecto agregado correctamente");
      closeModal();
    } catch (error) {
      console.error("❌ Error al crear proyecto:", error);
      alert("❌ Hubo un error al agregar el proyecto");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/20 backdrop-blur-md
        transition-all duration-300"
      onClick={closeModal}>
      <div
        className="bg-white p-6 rounded-lg w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Agregar Nuevo Proyecto</h3>

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

          {/* Autores dinámicos */}
          <label className="text-sm text-gray-600">Autores</label>
          {autores.map((autor, index) => (
            <input
              key={index}
              type="text"
              value={autor}
              onChange={(e) => handleChangeAutor(index, e.target.value)}
              placeholder={`Autor ${index + 1}`}
              className="border p-2 rounded"
              name={`autor_${index}`}
            />
          ))}
          <button
            type="button"
            onClick={handleAddAutor}
            className="text-blue-600 text-sm underline w-fit">
            + Añadir otro autor
          </button>

          {/* Telefono de contacto */}
          <input
            name="telefono_contacto"
            type="tel"
            placeholder="Teléfono de contacto"
            className="border p-2 rounded"
          />

          {/* Correo de contacto */}
          <input
            name="correo_contacto"
            type="email"
            placeholder="Correo de contacto"
            className="border p-2 rounded"
          />

          {/* Área de desarrollo */}
          <input
            name="area_desarrollo"
            type="text"
            placeholder="Área de desarrollo"
            className="border p-2 rounded"
          />

          {/* Subida de videos */}
          <label className="text-sm text-gray-600">Videos (puedes subir varios)</label>
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
