type CardBecadosProps = {
  nombre: string;
  titulo: string;
  exp: string;
};

function CardBecados({ nombre, titulo, exp }: CardBecadosProps) {
  return (
    <div className="flex flex-row items-start gap-4 p-4 border-b border-gray-300">
      {/* Imagen / avatar cuadrado */}
      <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-500">
        Img
      </div>

      {/* Columna izquierda: Nombre + Título */}
      <div className="flex flex-col w-40">
        <h2 className="text-lg font-bold">{nombre}</h2>
        <p className="text-sm text-gray-600">{titulo}</p>
      </div>

      {/* Separador */}
      <div className="w-[0.1rem] bg-gray-400 mx-2" />

      {/* Columna derecha: descripción */}
      <div className="flex-1">
        <p className="text-sm text-gray-700 leading-relaxed">{exp}</p>
        <a className="text-blue-600 hover:underline text-sm cursor-pointer">
          Leer más
        </a>
      </div>
    </div>
  );
}

export default CardBecados;
