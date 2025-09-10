import Header  from "../Components/Header"
import { useEffect, useState } from "react";
import CardPracticas from "../Components/CardPracticas";
import Practicas from "./Practicas";



export default function PracticasProfesionales() {
    const [data,setData] = useState({})
    useEffect(() => {
        fetch("http://localhost:3000/api/practicas/practicaProfesional?pagina=1")
        .then(res => res.json())
        .then(data => setData(data))
    },[])
    console.log(data)


    return (
        <main className="min-h-screen p-6">
            <Header />
            <div className="py-10 flex flex-col items-center text-justify m-10 gap-6">
                <div className="grid grid-cols-3 gap-20">
                    {data.practicas?.map((practica: any, index: number) => (
                        <CardPracticas Titulo={practica.labores} lugar={practica.sede_practica}/>
                    ))}
                   
                </div>
            </div>
        </main>
    )
}


