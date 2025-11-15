import React, { useCallback, useEffect } from "react";
import Loader from "../components/loader";
import CardPracticaAdmin from "../components/cardSimplePracticas";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast";
import Nav_button from "../components/nav_button";

export default function PracticasExistentes() {
  const nav = useNavigate();
  const param = window.location.pathname.split("/").pop();
  const type = param === "practicas-iniciales" ? "inicial" : "profesional";
  const [toast, setToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState<"success" | "error">(
    "success"
  );

  const [practicas, setPracticas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [n_practicas, setNPracticas] = React.useState(0);
  const n_pages = Math.max(1, Math.ceil(n_practicas / 10));

  const makeToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const fetchNewPage = async (newPagina: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/practicas/${type}?pagina=${newPagina}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setPracticas(data.practicas || []);
      setNPracticas(data.total || 0);
    } catch (error) {
      console.error("Error al cargar las prácticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const setPagina = (newPagina: number) => {
    const bounded = Math.min(Math.max(newPagina, 1), n_pages);
    setPage(bounded);
    fetchNewPage(bounded);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cargar = useCallback(
    async (pagina: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/practicas/${type}?pagina=${pagina}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        setPracticas(data.practicas || []);
        setNPracticas(data.total || 0);
      } catch (error) {
        console.error("Error al cargar las prácticas:", error);
        showToast("Error al cargar las prácticas", "error");
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    // Validar ruta
    if (
      param !== "practicas-iniciales" &&
      param !== "practicas-profesionales"
    ) {
      nav("/admin-practicas");
      return;
    }
    cargar(page);
  }, [param, nav, cargar, page]);

  const onUpdate = async () => {
    await cargar(page);
  };

  return (
    <main className="p-6 w-full min-h-screen ">
      {toast && <Toast message={toastMessage} status={toastType} />}
      {loading ? <Loader frase="Cargando..." /> : null}
      <h1 className="text-2xl font-bold mb-4 text-center mt-40">
        Administración de Prácticas Existentes
      </h1>
      <div className="px-30 py-10">
        <Nav_button Title="Volver" Link="/admin-practicas" />
      </div>
      <div className="p-20 grid grid-cols-3 gap-10 justify-center items-center sm:grid-cols-2 ">
        {!loading && practicas.length === 0 ? (
          <p>No hay prácticas disponibles.</p>
        ) : (
          practicas.map((practica: any, index: number) => (
            <CardPracticaAdmin
              key={index}
              id={practica.id}
              date={new Date(practica.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              titulo={practica.labores}
              empresa={practica.nombre_empresa}
              onUpdate={onUpdate}
              showToast={showToast}
              showloading={setLoading}
              estado={practica.state}
            />
          ))
        )}
      </div>
      <div className="flex flex-col items-center">
        {!loading && (
          <div className="flex flex-col mt-5 bg-gray-800/20 items-center rounded-3xl">
            <div className="flex flex-row items-center gap-8 m-5">
              <button
                onClick={() => setPagina(page - 1)}
                disabled={page === 1}
                className="text-xl rounded-2xl text-white bg-orange-400 disabled:bg-gray-700 hover:bg-orange-500 w-30 h-12 shadow-2xl">
                Anterior
              </button>
              <span className="text-2xl text-white">
                Página {page} de {n_pages}
              </span>
              <button
                onClick={() => setPagina(page + 1)}
                disabled={page === n_pages}
                className="text-xl rounded-2xl text-white bg-orange-500 disabled:bg-gray-700 hover:bg-orange-600 w-30 h-12 shadow-2xl">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
