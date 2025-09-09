export default function CardPracticas() {
    return (
        <div className="w-64 h-80 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">Imagen</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Título de la Práctica</h3>
            <p className="text-sm text-gray-600 flex-grow">Descripción breve de la práctica profesional o inicial.</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                Ver Más
            </button>
        </div>
    );
}
