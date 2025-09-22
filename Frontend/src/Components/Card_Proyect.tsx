interface ProyectoProps {
  titulo: string;
  area: string;
  correo: string;
  telefono: string;
  profesores: string
}

function Card_Proyectos({
  titulo,
  area,
  correo,
  telefono,
  profesores,
}: ProyectoProps) {
  return (
    <div className="min-w-[250px] max-w-[250px] border rounded-xl shadow-sm p-4 flex-shrink-0 snap-center bg-white">
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
      <h3 className="font-bold text-lg mb-1">{titulo}</h3>
      <p className="text-gray-600 text-sm">{profesores}</p>
      <p className="text-gray-500 text-sm mb-4">{area}</p>
      <p className="text-gray-500 text-sm mb-4">{correo} | {telefono}</p>
      <a href="#" className="text-blue-500 font-medium hover:underline mt-auto">
        Leer más
      </a>
    </div>
  );
}

export default Card_Proyectos;
