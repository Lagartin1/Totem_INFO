




function CardBecados({Name, Title, Tease}: {Name: string, Title: string, Tease: string}) {

    return (
        <div className="flex flex-row gap-2">
            <div className="h-50 w-50 bg-gray-200 rounded-2xl">
                imagen
            </div>
            <div className="flex flex-col gap-2 w-26">
                <h1 className="text-2xl font-bold p-2"> {Name}</h1>
                <p className="text-sm p-2"> {Title} </p>
            </div>
            <div className="w-[0.1rem] bg-black rounded-2xl"></div>
            <div className="h-50 max-w-[50rem]">
                <p className="text-sm p-2"> 
                    {Tease}
                </p>
                <a className="text-blue-500 hover:underline p-2">
                    Leer mas
                </a>
            </div>
        </div>
    )
}

export default CardBecados