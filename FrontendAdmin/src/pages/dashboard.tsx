import React, { use, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import UserCard from '../components/userCards';
interface User {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  authoriced: boolean;
}
import { useEffect } from 'react';
import { useCallback } from 'react';
import Toast from '../components/toast';




export default function Dashboard() { 
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate('/load-data');
  }


  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast,setToast] = useState<boolean>(false);
  const [toastmsg, setToastmsg] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<"success" | "error">("success");


  const makeToast = (message: string,status: "success" | "error") => {
    setToastmsg(message);
    setToastStatus(status);
    setTimeout(() => setToastmsg(null), 3000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/admin/registered',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            credentials: 'include',
          },
        }
      ).then(res => res.json());
      setData(data);
    } finally {
      return;
    }
  }, []);




  useEffect(() => { cargar(); }, [cargar]);

  const handleUpdated = async () => {
    await cargar();
    setLoading(false);
  };

  return (
    <main className='p-6 w-full min-h-screen '>
      {toast ? <Toast message={toastmsg as string} status={toastStatus} /> : null}
      <div className='bg-white shadow-md rounded-lg h-lvh flex flex-col justify-center items-center'>
        <div className="w-full max-w-4xl">
          <h1 className='text-3xl font-bold'>Panel de Administración</h1>
          <p>Bienvenido al panel de administración.</p> 
          <div className="flex flex-row gap-20 ">
            <div className="grid grid-cols-2 gap-4 text-white mt-24">
              <button className='w-40 h-40 bg-slate-600 rounded-2xl' onClick={() => navigate("/noticias")}> Administrar Noticias </button>
              <button className='w-40 h-40 bg-slate-600 rounded-2xl'onClick={()=>navigate("proyectos")} >  Administrar proyectos</button>
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl   hover:bg-slate-700' onClick={() => navigate("/admin-practicas")}>Administrar practicas</button>         
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl   hover:bg-slate-700' onClick={() => navigate("/workshop")}>Administrar workshops</button>             
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div className="">
                <h2 className="text-2xl font-semibold mt-4 font-sans"> Autorización de Usuarios</h2>
                <p>Lista de usuarios pendientes:</p>
              </div>
              {data.length === 0 && <p className='font-extrabold '>No hay usuarios pendientes.</p>}
              {data.map((user) => (
                <UserCard 
                  key={user.id}
                  id={user.id}
                  nombre={user.nombre}
                  apellido={user.apellido}
                  username={user.username}
                  email={user.email}
                  onUpdated={handleUpdated}
                  showToast={makeToast}
                  />
              ))}
            </div>
            
          </div>
        </div>
        
      </div>
    
    </main>
  );
} 
  