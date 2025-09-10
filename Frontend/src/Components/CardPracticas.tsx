import { useState } from 'react';
import IndicadorCard from './IndicadorCard';

export default function CardPracticas({Titulo, lugar}: {Titulo?: string, lugar?: string}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div className="w-100 h-80 bg-white rounded-lg shadow-md p-4 flex flex-col">
                <IndicadorCard value={true} />
                <div className="h-30 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                    logo
                </div>
                <h3 className="text-lg font-semibold mb-2">{Titulo}</h3>
                <div className='flex flex-row'>
                    <h3 className=' font-light'>Ubicacion:</h3>
                    <p className='ml-2 font-stretch-semi-condensed'>{lugar}</p>
                </div>
                <button 
                    onClick={openModal}
                    className="mt-4 bg bg-orange-400 text-white py-2 px-4 rounded"
                >
                    Ver Más
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="absolute bg-black/5 w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition ease-out inset backdrop-blur-sm flex items-center justify-center z-50">
                    <button 
                                    onClick={closeModal}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition duration-300"
                                >
                                    Cerrar
                                </button>
                </div>
            )}
        </>
    );
}
