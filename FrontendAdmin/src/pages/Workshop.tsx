import { useCallback, useEffect, useState } from "react";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import CardWorkshop from "../components/Card_Workshop";
import Nav_button from "../components/Nav_Button";

// Interfaz para tipado seguro
interface Workshop {
  id: string;
  titulo: string;
  descripcion: string;
  link: string;
  fecha: string;
}

export default function Workshop() {
  const [pagina, setPagina] = useState<number>(1);
  const [data, setData] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<boolean>(false);
  
  // Estados para Toast
  const [toast, setToast] = useState<boolean>(false);
  const [toastmsg, setToastmsg] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<"success" | "error">("success");

  const [totalWorkshops, setTotalWorkshops] = useState<number>(0);
  const n_pages = Math.max(1, Math.ceil(totalWorkshops / 12));
  
  const [newWorkshopData, setNewWorkshopData] = useState({
    titulo: "",
    link: "",
    descripcion: "",
  });

  // --- Helpers ---
  const makeToast = (message: string, status: "success" | "error") => {
    setToastmsg(message);
    setToastStatus(status);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const onChangeNewWorkshop = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewWorkshopData({
      ...newWorkshopData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Cargar Datos (GET) ---
  const cargar = useCallback(async (page: number) => {
    setLoading(true);
    try {
      // ✅ URL CORREGIDA: Apunta a la ruta estándar
      const response = await fetch(`/api/workshops?pagina=${page}`, {
        method: "GET",
      });
      
      if (!response.ok) throw new Error("Error al cargar workshops");

      const result = await response.json();
      
      // ✅ ADAPTACIÓN DE RESPUESTA: { data: [], total: N }
      // Verifica si 'result.data' es el objeto contenedor o el array directo
      const workshopsArray = Array.isArray(result.data) ? result.data : result.data?.data || [];
      const total = result.data?.total || result.total || 0;

      setData(workshopsArray);
      setTotalWorkshops(total);

    } catch (error) {
      console.error(error);
      makeToast("No se pudieron cargar los workshops.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Guardar Nuevo (POST) ---
  const onSave = async () => {
    if (!newWorkshopData.titulo || !newWorkshopData.link) {
        makeToast("Título y Link son obligatorios", "error");
        return;
    }

    setLoading(true);
    try {
      // ✅ URL CORREGIDA: Usamos la misma ruta base con método POST
      const response = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorkshopData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear");
      }

      makeToast("Workshop creado exitosamente.", "success");
      setNewWorkshopData({ titulo: "", link: "", descripcion: "" });
      setModal(false);
      await cargar(1); // Recargar primera página
      setPagina(1);

    } catch (error: any) {
      console.error(error);
      makeToast(error.message || "Error al crear el workshop.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Efectos ---
  useEffect(() => {
    cargar(pagina);
  }, [cargar, pagina]);

  const onUpdate = async () => {
    await cargar(pagina);
  };

  const onCancel = () => {
    setNewWorkshopData({ titulo: "", link: "", descripcion: "" });
    setModal(false);
  };

  return (
    <main className="p-6 w-full min-h-screen">
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/dashboard" />
      </div>

      {loading && <Loader />}
      {toast && <Toast message={toastmsg as string} status={toastStatus} />}

      <div className="bg-white shadow-md rounded-lg min-h-[80vh] flex flex-col items-center py-10">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">
          Administración de Workshops
        </h1>

        {/* Grid de Cards */}
        <div className="w-full max-w-6xl px-4 mb-8">
          {data.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              <p>No hay workshops disponibles.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {data.map((workshop) => (
                <CardWorkshop
                  key={workshop.id}
                  {...workshop}
                  onUpdate={onUpdate}
                  showToast={makeToast}
                  showLoader={setLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && data.length > 0 && (
            <div className="flex items-center gap-4 mb-8 bg-gray-100 px-6 py-3 rounded-full shadow-sm">
            <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white disabled:bg-gray-300 hover:bg-orange-600 transition-colors"
            >
                Anterior
            </button>
            <span className="text-gray-700 font-medium">
                Página {pagina} de {n_pages}
            </span>
            <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === n_pages}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white disabled:bg-gray-300 hover:bg-orange-600 transition-colors"
            >
                Siguiente
            </button>
            </div>
        )}

        {/* Botón Agregar */}
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md transition-colors font-semibold"
          onClick={() => setModal(true)}
        >
          + Agregar Nuevo Workshop
        </button>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Nuevo Workshop</h2>
              
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Ej: Taller de React"
                        value={newWorkshopData.titulo}
                        onChange={onChangeNewWorkshop}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link de YouTube</label>
                    <input
                        type="text"
                        name="link"
                        placeholder="https://youtube.com/..."
                        value={newWorkshopData.link}
                        onChange={onChangeNewWorkshop}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                        name="descripcion"
                        placeholder="Detalles del evento..."
                        value={newWorkshopData.descripcion}
                        onChange={onChangeNewWorkshop}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                  onClick={onSave}
                >
                  Guardar
                </button>
                <button
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-medium transition-colors"
                  onClick={onCancel}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}