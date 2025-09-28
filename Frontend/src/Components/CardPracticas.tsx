import { useState } from 'react';
import IndicadorCard from './IndicadorCard';
import { IdentificationIcon ,BuildingOffice2Icon,MapPinIcon} from "@heroicons/react/24/outline";



interface CardPracticasProps {
    id:string;
    Titulo: string;
    lugar: string;
    nombre_contacto: string;
    telefono_contacto: string;
    cargo_contacto: string;
    email_contacto: string;
    regimen_trabajo: string;
    requisitos: string;
    modalidad:string;
    beneficios:string;
    nombre_empresa:string;
}

export default function CardPracticas({
    Titulo,
    lugar,
    nombre_contacto,
    telefono_contacto,
    cargo_contacto,
    email_contacto,
    regimen_trabajo,
    requisitos,
    modalidad,
    beneficios,
    nombre_empresa,
} : CardPracticasProps) {
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
                <div className="fixed inset-0 bg-black/5 w-full h-full top-1/2 left-1/2 
                                transform -translate-x-1/2 -translate-y-1/2 transition 
                                ease-out inset backdrop-blur-sm flex items-center justify-center z-50 ">
                    <div className='flex flex-col h-[70vh] w-[60vw] bg-white rounded-xl text-justify items-center'>
                        <h2 className="p-10 text-2xl font-sansfont font-semibold">{Titulo} </h2>
                        <div className="flex flex-col gap-3 w-[50vw]">
                            <div className="pr-6 border-b border-gray-500 items-start">
                                <h3 className="font-semibold">Características</h3>
                            </div>
                            <div className="pl-6">
                                {[modalidad,regimen_trabajo]?.map((item:string, index:number)=>(
                                    <li key={index}>
                                        <ul>
                                            <p> {item? item : null}</p>
                                        </ul>
                                    </li>
                                )
                                )}    
                            </div>

                        </div>
                        <div className="flex flex-col gap-3 w-[50vw] mt-5 ">
                            <div className="pr-6 border-b border-gray-500 items-start">
                                <h3 className="font-semibold">Requisitos</h3>
                            </div>
                            <div className="pl-6">
                                <p>{requisitos}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-[50vw] mt-5 ">
                            <div className="pr-6 border-b border-gray-500 items-start">
                                <h3 className="font-semibold">Beneficios</h3>
                            </div>
                            <div className="pl-6">
                                <p>{beneficios}</p>
                            </div>
                        </div>
                        <div className='py-10 items-start flex flex-row'>
                            <div className="flex flex-col ">
                                <div className="flex flex-row gap-3 items-center font-sans ">
                                    <BuildingOffice2Icon className=" h-10 w-9"/>
                                    <p>Empresa: {nombre_empresa}</p>
                                </div>
                                <div className="flex flex-row gap-3 items-center font-sans ">
                                    <MapPinIcon className=" h-10 w-9"/>
                                    <p>Ubicación: {lugar}</p>
                                </div>
                                

                            </div>
                            <div className='flex items-start flex-row border-l-1 gap-3 ml-3'>
                                <IdentificationIcon className="ml-2 h-10 w-10" />
                                <div className="flex flex-col items-start ml-5 font-sans ">
                                    <p>Nombre Contacto: {nombre_contacto}</p>
                                    <p>Cargo: {cargo_contacto}</p>
                                    <p>Teléfono: {telefono_contacto}</p>
                                    <p>Email: {email_contacto}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-1">
                            <button onClick={closeModal}
                                    className="bg-red-500 hover:bg-red-600 text-white
                                    m-2 w-30 h-10 rounded-lg font-semibold transition duration-300"
                            >
                            Cerrar
                            </button>
                        </div>
                </div>
                    </div>
                   
            )}
        </>
    );
}
