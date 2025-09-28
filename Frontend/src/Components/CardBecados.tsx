interface CardBecadosProps {
  nombre: string;
  titulo: string;
  exp: string;
}

function CardBecados({ nombre, titulo, exp }: CardBecadosProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 border rounded-xl shadow-sm p-4 bg-white w-full max-w-5xl">
      {/* Imagen o placeholder */}
      <div className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
        Imagen
      </div>

      {/* Info principal */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{nombre}</h1>
          <p className="text-sm text-gray-600 mt-1">{titulo}</p>
        </div>

        {/* Línea divisoria en mobile */}
        <div className="my-3 md:hidden border-t border-gray-300"></div>

        {/* Descripción */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">{exp}</p>
          <button className="mt-3 text-blue-600 hover:underline font-medium">
            Leer más
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardBecados;
