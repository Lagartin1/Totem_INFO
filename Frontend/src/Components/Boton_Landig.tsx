import { useNavigate,Link } from "react-router-dom";


function Boton_Landing({Title,Link}: {Title: string, Link: string}) {
    return (
    <div className="flex flex-row items-center rounded-2xl p-10 w-60 h-40 bg-blue-200 " >
        <a href={Link} className="text-justify">
            <h3 className="text-2xl p-5">{Title}</h3>
        </a>
    </div>

    )
}

export default Boton_Landing;   
