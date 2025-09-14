

function Boton_Landing({Title}: {Title: string, Link: string,}) {

    return (
    <div className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer">
        <h3 className=" text-balance text-2xl p-5 text-white">{Title}</h3>
    </div>

    )
}

export default Boton_Landing;   
