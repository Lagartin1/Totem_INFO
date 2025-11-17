import { useCallback, useEffect, useState } from "react";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import CardWorkshop from "../components/Card_Workshop";
import Nav_button from "../components/Nav_Button";

export default function Workshop() {
  const [pagina, setPagina] = useState<number>(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<boolean>(false);
  const [toast, setToast] = useState<boolean>(false);
  const [toastmsg, setToastmsg] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<"success" | "error">(
    "success"
  );
  const [totalWorkshops, setTotalWorkshops] = useState<number>(0);
  const n_pages = Math.max(1, Math.ceil(totalWorkshops / 12));
  const [newWorkshopData, setNewWorkshopData] = useState<{
    titulo: string;
    link: string;
    descripcion: string;
  }>({ titulo: "", link: "", descripcion: "" });

  const onChangeNewWorkshop = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewWorkshopData({
      ...newWorkshopData,
      [e.target.name]: e.target.value,
    });
  };

  const onSave = async () => {
    const performUpload = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/administrar/workshops", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newWorkshopData),
        });
        const result = await response.json();
        if (response.status !== 401) {
          if (!result.ok) {
            throw new Error(result.message || "Error creating workshop");
          }
          makeToast("Workshop creado exitosamente.", "success");
        } else {
          const responseRefresh = await fetch("/api/admin/auth/refresh", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          if (responseRefresh.ok) {
            // Reintentar la creación del workshop después de refrescar el token
            const retryResponse = await fetch(
              "/api/admin/administrar/workshops",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  credentials: "include",
                },

                body: JSON.stringify(newWorkshopData),
              }
            );
            const retryResult = await retryResponse.json();
            if (!retryResult.ok) {
              throw new Error(
                retryResult.message ||
                  "Error creating workshop after token refresh"
              );
            }
            makeToast("Workshop creado exitosamente.", "success");
          } else {
            throw new Error(
              "No autorizado. Por favor, inicie sesión de nuevo."
            );
          }
        }
        // resetear datos
        setNewWorkshopData({ titulo: "", link: "", descripcion: "" });
        setModal(false);
        await cargar(pagina);
      } catch (error) {
        makeToast("Error al crear el workshop.", "error");
      } finally {
        setLoading(false);
      }
    };
    try {
      await performUpload();
    } catch (error) {
      makeToast("Error al crear el workshop.", "error");
    }
  };

  const makeToast = (message: string, status: "success" | "error") => {
    setToastmsg(message);
    setToastStatus(status);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const cargar = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workshops?pagina=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.message || "Error fetching workshops");
      }
      setData(result.data.data || []);
      setTotalWorkshops(result.data.total || 0);
    } catch (error) {
      makeToast("Error al cargar los workshops.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const onCancel = () => {
    // resetear datos
    setNewWorkshopData({ titulo: "", link: "", descripcion: "" });
    setModal(false);
  };

  useEffect(() => {
    cargar(pagina);
  }, [cargar, pagina]);

  const onUpdate = async () => {
    await cargar(pagina);
  };

  return (
    <main className="p-6 w-full min-h-screen ">
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/dashboard" />
      </div>
      {loading ? <Loader /> : null}
      {toast ? (
        <Toast message={toastmsg as string} status={toastStatus} />
      ) : null}
      <div className="bg-white shadow-md rounded-lg h-lvh flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">
          Administracion Información Workshop
        </h1>
        <div className="flex flex-row justify-center items-center w-full">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 mt-20 ml-20 mr-20 overflow-y-auto">
            {!loading && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center col-span-3">
                <p>No hay workshops disponibles.</p>
              </div>
            ) : null}
            {!loading && data.length > 0
              ? data.map((workshop) => (
                  <CardWorkshop
                    onUpdate={onUpdate}
                    showToast={makeToast}
                    showLoader={setLoading}
                    key={workshop.id}
                    {...workshop}
                  />
                ))
              : null}
            {!loading && data.length > 0 ? (
              <div className="col-span-3 flex justify-center">
                <div className="s flex flex-col mt-5 bg-gray-800/50 items-center justify-center rounded-3xl">
                  <div className="flex flex-row items-center gap-8 m-5">
                    <button
                      onClick={() => setPagina(pagina - 1)}
                      disabled={pagina === 1}
                      className="text-xl rounded-2xl text-white bg-orange-400 disabled:bg-gray-700 hover:bg-orange-500 w-30 h-12 shadow-2xl">
                      Anterior
                    </button>
                    <span className=" text-white text-nowrap">
                      Página {pagina} de {n_pages}
                    </span>
                    <button
                      onClick={() => setPagina(pagina + 1)}
                      disabled={pagina === n_pages}
                      className="text-xl rounded-2xl text-white bg-orange-500 disabled:bg-gray-700 hover:bg-orange-600 w-30 h-12 shadow-2xl">
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <h2 className="text-xl font-semibold mb-4">
              Agregar Nuevo Workshop
            </h2>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setModal(true)}>
              Agregar Workshop
            </button>
          </div>
          {modal && (
            <div
              className="fixed inset-0 bg-black/20 w-full h-full top-1/2 left-1/2 
                              transform -translate-x-1/2 -translate-y-1/2 transition 
                              ease-out inset backdrop-blur-sm flex items-center justify-center z-50 ">
              <div className="flex flex-col  bg-white rounded-xl text-justify items-center p-6">
                <h2 className="text-2xl font-bold mb-4">Nuevo Workshop</h2>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  value={newWorkshopData.titulo}
                  onChange={onChangeNewWorkshop}
                  required
                  className="border border-gray-300 rounded-md p-2 mb-4 w-80"
                />
                <input
                  type="text"
                  name="link"
                  placeholder="Link al video del Workshop"
                  value={newWorkshopData.link}
                  onChange={onChangeNewWorkshop}
                  required
                  className="border border-gray-300 rounded-md p-2 mb-4 w-80"
                />
                <textarea
                  name="descripcion"
                  placeholder="Descripción(opcional)"
                  value={newWorkshopData.descripcion}
                  onChange={onChangeNewWorkshop}
                  className="border border-gray-300 rounded-md p-2 mb-4 w-80 h-32"
                />
                <div className="flex gap-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    onClick={onSave}>
                    Guardar
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={onCancel}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
