import { useNavigate } from "react-router-dom";


function Boton_Landing({Title,Link}: {Title: string, Link: string}) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(Link);
    };

    return (
    <div className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-blue-200 shadow-2xl" onClick={handleClick}>
        <h3 className="text-justify text-2xl p-5">{Title}</h3>
    </div>

    )
}

export default Boton_Landing;   
