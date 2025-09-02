
import Headers from "../Components/Header"
import CardBecados from "../Components/CardBecados"


function Becados (){

    return(
        <main className="min-h-screen w-full flex flex-col items-center bg-white-500">
            <Headers/>
            <div className="flex flex-col p-20 gap-20">
                <CardBecados/>
                <CardBecados/>
                <CardBecados/>
                <CardBecados/>
                <CardBecados/>
            </div>

        </main>
    )

}

export default Becados