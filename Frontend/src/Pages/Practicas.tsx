import Headers from "../Components/Header"
import Boton_Landing from "../Components/Boton_Landing"
import NavBar from "../Components/NavBar"

function Practicas (){

    return(
        <main className="min-h-screen w-full flex flex-col bg-white-500">
            <NavBar/>
            <div className="flex flex-col items-center text-justify mt-40 gap-20 ">
                <Boton_Landing Title="Prácticas Profesionales" Link="/practicas/practicas-profesionales" page={1}/>
                <Boton_Landing Title="Práctica Inicial" Link="/practicas/practicas-iniciales" page={1}   />
            </div>


        </main>
    )

}

export default Practicas