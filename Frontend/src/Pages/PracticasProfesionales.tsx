import Header  from "../Components/Header"
import { useEffect, useState } from "react";
import CardPracticas from "../Components/CardPracticas";


async function fetchPracticasProfesionales() {
    try {
        const response = await fetch('http://localhost:3000/api/practicas/practicaProfesional?pagina=1');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return [];
    }
}


export default function PracticasProfesionales() {
    const [practicas, setPracticas] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchPracticasProfesionales();
            setPracticas(result);
            console.log(result)
        };
        fetchData();
    }, []);


    return (
        <main className="min-h-screen p-6">
            <Header />
            <div className="py-10 flex flex-col items-center text-justify m-5 gap-6">
                <div className="grid grid-cols-1 gap-20">


                <CardPracticas/>
                </div>
            </div>
        </main>
    )
}


