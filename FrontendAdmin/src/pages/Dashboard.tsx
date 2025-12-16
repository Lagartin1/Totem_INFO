import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../components/User_Cards";
import Toast from "../components/Toast";
import IconJobOffer from "../assets/icons/001-job-offer.png";
import IconClosure from "../assets/icons/002-closure.png";
import IconNews from "../assets/icons/003-news.png";
import IconStudent from "../assets/icons/004-student.png";
import IconWorkshop from "../assets/icons/005-workshop.png";
import IconEarth from "../assets/icons/006-earth.png";
import { useAuth } from "../lib/authProvider";

interface User {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  authoriced: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<boolean>(false);
  const [toastmsg, setToastmsg] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<"success" | "error">(
    "success"
  );
  const [pagina, setPagina] = useState<number>(1);
  const [n_paginas, setN_Paginas] = useState<number>(1);

  const setPages = (total_users: number) => {
    const pages = Math.ceil(total_users / 5);
    setN_Paginas(pages);
  };

  const makeToast = (message: string, status: "success" | "error") => {
    setToastmsg(message);
    setToastStatus(status);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    const performFetch = async () => {
      const response = await fetch(`/api/admin/registered?pagina=${pagina}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.status === 401) {
        const refresh = await fetch(`/api/admin/auth/refresh`, {
          method: "GET",
          credentials: "include",
        });
        if (refresh.ok) {
          const retryResponse = await fetch(
            `/api/admin/registered?pagina=${pagina}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          if (!retryResponse.ok) {
            throw new Error("Error al cargar los usuarios registrados");
          }
          return retryResponse;
        } else {
          // Refresh falló - tokens inválidos o expirados
          await logout();
          makeToast("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "error");
          navigate("/");
          throw new Error("Sesión expirada");
        }
      } else if (!response.ok) {
        throw new Error("Error al cargar los usuarios registrados");
      }
      return response;
    };

    try {
      const res = await performFetch();
      const resData = await res.json();
      const users = Array.isArray(resData?.users) ? resData.users : [];
      setData(users);
      setPages(typeof resData?.total === "number" ? resData.total : users.length);
    } catch (error) {
      console.error("Error al cargar los usuarios registrados:", error);
      if (error instanceof Error && error.message !== "Sesión expirada") {
        makeToast("Error al cargar los usuarios registrados", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [pagina, logout, navigate]);

  useEffect(() => {
    cargar();
  }, [cargar, pagina]);

  const handleUpdated = async () => {
    await cargar();
    setLoading(false);
  };

  const chagePage = async (newPagina: number) => {
    const bounded = Math.min(Math.max(newPagina, 1), n_paginas);
    setPagina(bounded);
    await handleUpdated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const modules = [
  {
    title: "Noticias",
    description: "Crear y editar noticias del sitio",
    path: "/noticias",
    icon: IconNews,
  },
  {
    title: "Proyectos",
    description: "Administrar proyectos vigentes",
    path: "/proyectos",
    icon: IconClosure,
  },
  {
    title: "Prácticas",
    description: "Gestionar ofertas y top visitas",
    path: "/admin-practicas",
    icon: IconJobOffer,
  },
  {
    title: "Workshops",
    description: "Configurar talleres y charlas",
    path: "/workshop",
    icon: IconWorkshop,
  },
  {
    title: "Becados",
    description: "Control de estudiantes becados",
    path: "/becados",
    icon: IconStudent,
  },
  {
    title: "Gira",
    description: "Administrar información de giras",
    path: "/gira",
    icon: IconEarth,
  },
];

  return (
    <main className="min-h-screen w-full bg-slate-100 p-6">
      {toast && <Toast message={toastmsg as string} status={toastStatus} />}

      <div className="max-w-[90rem] mx-auto w-full px-6">
        <div className="bg-white/90 shadow-sm border border-slate-200 rounded-3xl p-8 md:p-10">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-slate-500 mt-1">
                Bienvenido al panel de administración. Desde aquí puedes gestionar
                el contenido y los usuarios de la plataforma.
              </p>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* MÓDULOS */}
            <section className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                Módulos principales
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Selecciona una sección para administrar su contenido.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {modules.map((mod) => (
                  <button
                    key={mod.path}
                    onClick={() => navigate(mod.path)}
                    className="group relative flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left shadow-sm hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition transform"
                  >
                    {/* Icono simple con letra (podrías cambiarlo luego por SVG o Heroicons) */}
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 mb-1">
                      <img
                        src={mod.icon}
                        alt={`Icono ${mod.title}`}
                        className="w-6 h-6 opacity-80"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Administrar {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {mod.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* AUTORIZACIÓN DE USUARIOS */}
            <section className="w-full lg:w-80 xl:w-96 flex flex-col gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Autorización de Usuarios
                  </h2>
                  <span className="rounded-full bg-slate-800 text-white text-xs px-3 py-1">
                    {data.length} pendientes
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Revisa y autoriza el acceso de nuevos usuarios.
                </p>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {data.length === 0 && !loading && (
                    <p className="text-sm font-medium text-slate-500">
                      No hay usuarios pendientes.
                    </p>
                  )}
                  {loading && (
                    <p className="text-sm text-slate-400">
                      Cargando usuarios...
                    </p>
                  )}
                  {data.map((user) => (
                    <UserCard
                      key={user.id}
                      id={user.id}
                      nombre={user.nombre}
                      apellido={user.apellido}
                      username={user.username}
                      email={user.email}
                      onUpdated={handleUpdated}
                      showToast={makeToast}
                    />
                  ))}
                </div>
              </div>

              {/* Paginación */}
              {!loading && n_paginas > 1 && (
                <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 flex flex-col items-center gap-2 shadow-md">
                  <span className="text-sm font-medium">
                    Página {pagina} de {n_paginas}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => chagePage(pagina - 1)}
                      disabled={pagina === 1}
                      className="rounded-xl bg-orange-400 px-4 py-2 text-sm font-semibold disabled:bg-slate-600 hover:bg-orange-500 transition"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => chagePage(pagina + 1)}
                      disabled={pagina === n_paginas}
                      className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold disabled:bg-slate-600 hover:bg-orange-600 transition"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
