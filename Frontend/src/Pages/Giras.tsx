import React from "react";
import Loader from "../Components/Loader";
import Card_Giras from "../Components/Card_Giras";
import NavBar from "../Components/NavBar";

export default function Giras() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingPage, setLoadingPage] = React.useState<boolean>(false);
  const [giras, setGiras] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  React.useEffect(() => {
    setLoadingPage(true);
    fetch(`/api/gira?pagina=${page}`) // Ajusta pageSize según sea necesario
      .then((response) => response.json())
      .then((data) => {
        console.log("Respuesta API:", data);
        setGiras(data.giras);
        setTotalPages(Math.ceil(data.total / 6)); // Asumiendo un pageSize de 6
        console.log(data);
        setLoadingPage(false);
      })
      .catch((error) => {
        console.error("Error al obtener las giras:", error);
      });
  }, [page]);

  const fetchNewPage = (newPage: number) => {
    setLoading(true);
    fetch(`/api/gira?pagina=${newPage}`) // Ajusta pageSize según sea necesario
      .then((response) => response.json())
      .then((data) => {
        setGiras(data.giras);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener las giras:", error);
        setLoading(false);
      });
  };

  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
      {loading && <Loader frase="Cargando video..." />}
      {loadingPage && <Loader frase="Cargando página..." />}
      <NavBar />
      <div className="mt-20 flex flex-row gap-20 justify-center">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-10">
            {giras.map((gira) => (
              <Card_Giras
                key={gira.link}
                title={gira.titulo}
                date={gira.fecha}
                description={gira.descripcion}
                link={gira.link}
                setLoading={setLoading}
              />
            ))}
          </div>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <button
              type="button"
              onClick={() => fetchNewPage(Math.max(1, page - 1))}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
              aria-label="Anterior"
              disabled={page <= 1}>
              ‹
            </button>

            {Array.from(
              { length: Math.max(1, Math.ceil(totalPages || 1)) },
              (_, i) => {
                const p = i + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-sm rounded focus:outline-none ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Página ${p}`}>
                    {p}
                  </button>
                );
              }
            )}

            <button
              type="button"
              onClick={() =>
                fetchNewPage(
                  Math.min(Math.max(1, Math.ceil(totalPages || 1)), page + 1)
                )
              }
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
              aria-label="Siguiente"
              disabled={page >= Math.max(1, Math.ceil(totalPages || 1))}>
              ›
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center">
          <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20 ">
            Giras
          </h1>
          <p className="text-white/90 text-lg font-semibold text-center justify-center p-5 mt-5">
            Las Giras Académicas son experiencias educativas que permiten a los
            estudiantes de Ingeniería Civil en Informática conocer de cerca el
            mundo profesional y empresarial, visitando empresas tecnológicas,
            centros de investigación y organizaciones del sector. Estas
            actividades complementan la formación académica con experiencia
            práctica real, fomentando el networking y la comprensión del mercado
            laboral. Durante las giras, los estudiantes pueden interactuar con
            profesionales del área, conocer procesos productivos y tecnologías
            de vanguardia, ampliando su visión sobre las oportunidades
            profesionales en el campo de la informática.
          </p>
        </div>
      </div>
    </main>
  );
}
