import {useNavigate} from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate();
  const onClick = () => {
    navigate('/');
  };
  return (
    <main className='w-full min-h-screen flex items-center justify-center flex-col gap-10 text-center'>
      <div className="p-10 w-80 h-80 text-gray-300 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-file-exclamation-point-icon lucide-file-exclamation-point"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <div className="flex flex-col gap-10 items-center">
        <h1 className='text-6xl font-semibold'>Oops, no encontramos esa página</h1>
        <button className='px-5 py-2 bg-slate-500 text-white rounded hover:bg-slate-600' onClick={onClick} >Volver a la página principal</button>
      </div>
    </main>
  );
}