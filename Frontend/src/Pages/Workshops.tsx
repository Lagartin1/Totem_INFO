import React from "react";

import Loader from "../Components/Loader";
import CardWorkshop from "../Components/Workshop_card";
import Nav_button from "../Components/Nav_Button";







export default function Workshops() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingPage, setLoadingPage] = React.useState<boolean>(false);
  const [workshops,setWorkshops] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);


  React.useEffect(() => {
    setLoadingPage(true);
    fetch(`/api/workshops?pagina=${page}`)  // Ajusta pageSize según sea necesario
      .then(response => response.json())
      .then(data => {
        setWorkshops(data.data);
        setTotalPages(Math.ceil(data.total / 6)); // Asumiendo un pageSize de 6
        console.log(data);
        setLoadingPage(false);

      })
      .catch(error => {
        console.error('Error al obtener los workshops:', error);
      });

  }, [page]);

  const fetchNewPage = (newPage: number) => {
    setLoading(true);
    fetch(`/api/workshops?pagina=${newPage}`)  // Ajusta pageSize según sea necesario
      .then(response => response.json())
      .then(data => {
        setWorkshops(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener los workshops:', error);
        setLoading(false);
      });
  }
  


  return (
    <main className="min-h-screen min-w-screen w-full flex flex-col items-center bg-white-500">
      {loading && <Loader frase="Cargando video..." />}
      {loadingPage && <Loader frase="Cargando página..." />}
      <div className="absolute w-50 h-20 top-10 left-10">
        <Nav_button Title="Volver" Link="/"/>
      </div>
      <div className="mt-40 flex flex-row gap-20 justify-center">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-10">
            {workshops.map((workshop) => ( 
              <CardWorkshop 
                key={workshop.link}
                title={workshop.titulo}
                date={workshop.fecha}
                description={workshop.descripcion}
                link={workshop.link}
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
              disabled={page <= 1}
            >
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
                aria-label={`Página ${p}`}
                >
                {p}
                </button>
              );
              }
            )}

            <button
              type="button"
              onClick={() => fetchNewPage(Math.min(Math.max(1, Math.ceil(totalPages || 1)), page + 1))}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none disabled:opacity-50"
              aria-label="Siguiente"
              disabled={page >= Math.max(1, Math.ceil(totalPages || 1))}
            >
              ›
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-slate-500 rounded-lg w-1/4 items-center" >
          <h1 className="text-white text-4xl font-bold justify-center p-10 mt-20 ">Workshops</h1>
          <p className="text-white/90 text-lg font-semibold text-center justify-center p-5 mt-5">
          El Workshop de Informática es un ciclo de charlas y presentaciones donde estudiantes
          de Ingeniería Civil en Informática pueden conectar con el mundo profesional,
          compartir conocimientos y explorar las últimas tendencias tecnológicas.
          Organizado por estudiantes de último año, este evento se realiza cada semestre 
          y se ha convertido en un punto de encuentro clave para fortalecer los lazos con el medio.
          Desde su primera edición en 2014, el Workshop ha mantenido su esencia de aprendizaje 
          colaborativo, adaptándose a nuevas temáticas y ofreciendo una experiencia enriquecedora 
          para todos los participantes.
          </p>
        </div>
      </div>  

    </main>
  );
}
