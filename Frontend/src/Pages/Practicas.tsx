import Headers from "../Components/Header"
import Boton_Landing from "../Components/Boton_Landing"

function Practicas (){

    return(
        <main className="min-h-screen w-full flex flex-col bg-white-500">
            <Headers/>
            <div> </div>
            <div className="container flex flex-col items-center text-justify m-10 gap-20 ">
                <Boton_Landing Title="Practicas Profesionales" Link="/practica-profesional"/>
                <Boton_Landing Title="Practica Inicial" Link="/practica-inicial"/>
            </div>


        </main>
    )

}

export default Practicas