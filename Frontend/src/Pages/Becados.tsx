
import Headers from "../Components/Header"
import CardBecados from "../Components/CardBecados"


function Becados (){

    return(
        <main className="min-h-screen w-full flex flex-col bg-white-500">
            <Headers/>
            <div className="flex flex-col p-20 gap-20 items-center">
                <CardBecados Name="Nombre 1" Title="Titulo 1" Tease="Descripcion breve del becado 1" />
                <CardBecados Name="Nombre 2" Title="Titulo 2" Tease="Descripcion breve del becado 2" />
                <CardBecados Name="Nombre 3" Title="Titulo 3" Tease="Descripcion breve del becado 3" />
                <CardBecados Name="Nombre 4" Title="Titulo 4" Tease="Descripcion breve del becado 4" />
                <CardBecados Name="Nombre 5" Title="Titulo 5" Tease="Descripcion breve del becado 5" />
            </div>

        </main>
    )

}

export default Becados