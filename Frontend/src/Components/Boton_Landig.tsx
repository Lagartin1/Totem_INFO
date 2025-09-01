import { useNavigate,Link } from "react-router-dom";


function Boton_Landing({Title,Link}: {Title: string, Link: string}) {
    return (
    <div className="flex flex-row items-center rounded-2xl p-10 w-60 h-40 bg-blue-200 text-center " >
        <a href={Link}>
            <h3 className="text-2xl mx-10">{Title}</h3>
        </a>
    </div>

    )
}

export default Boton_Landing;   
