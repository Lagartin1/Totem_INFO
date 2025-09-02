function Card_Proyectos({card} : {card: number}) {
  return (
    <div
      key={card}
      className="min-w-[250px] max-w-[250px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center"
    >
      {/* Imagen */}
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>

      {/* Contenido */}
      <h3 className="font-bold text-lg mb-1">Título</h3>
      <p className="text-gray-600 text-sm">Docente</p>
      <p className="text-gray-500 text-sm mb-4">Fecha</p>

      {/* Leer más */}
      <a href="#" className="text-blue-500 font-medium hover:underline mt-auto">
        Leer más
      </a>
    </div>
  );
}
export default Card_Proyectos;
