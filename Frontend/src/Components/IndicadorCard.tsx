

export default function IndicadorCard({value}:{value?: boolean}) {
    return (
        <div className="flex flex-row justify-end mb-2">
            <p className=' text-black font-semibold'>Estado</p>

            {
            value ? (
                <div className='flex flex-row justify-center items-center'>
                <div className=" relative w-3 h-3 bg-green-200/90 rounded-full ml-2 items-center">
                    <div className=" absolute w-2 h-2 bottom-0.5 left-0.5 bg-green-500 rounded-full"></div>
                </div>
                <p className='font-thin ml-2'>Activa</p>
            </div>

            ) : (

                <div className='flex flex-row justify-center items-center'>
                    <div className=" relative w-3 h-3 bg-red-200/90 rounded-full ml-2 items-center">
                        <div className=" absolute w-2 h-2 bottom-0.5 left-0.5 bg-red-500 rounded-full"></div>
                    </div>
                    <p className='font-thin ml-2'>Inactiva</p>

                </div>
            )
            }

        </div>
    )   
}
