import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline"


function nav_button({Title,Link}: {Title: string, Link: string}) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(Link);
    };

    return (
    <div className="flex items-center justify-center rounded-3xl p-10 w-50 h-10 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer" onClick={handleClick}>
        <ChevronLeftIcon className="h-5 w-5 text-white" />
        <h3 className=" text-balance text-xl p-5 text-white">{Title}</h3>
    </div>

    )
}

export default nav_button;   