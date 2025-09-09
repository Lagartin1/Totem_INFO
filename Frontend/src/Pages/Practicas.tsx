import Headers from "../Components/Header"
import Boton_Landing from "../Components/Boton_Landing"
import Nav_button from "../Components/nav_button"

function Practicas (){

    return(
        <main className="min-h-screen w-full flex flex-col bg-white-500">
            <Headers/>
            <div className="px-30 py-10">
                <Nav_button Title="Volver" Link="/"/>
            </div>
            <div className="flex flex-col items-center text-justify m-5 gap-20 ">
                <Boton_Landing Title="Practicas Profesionales" Link="/practicas/practicas-profesionales"/>
                <Boton_Landing Title="Practica Inicial" Link="/practica-inicial"/>
            </div>


        </main>
    )

}

export default Practicas