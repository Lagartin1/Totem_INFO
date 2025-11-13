import React, { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import UserCard from '../components/userCards';
import { useCallback } from 'react';
import Toast from '../components/toast';


interface User {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  authoriced: boolean;
}

export default function Dashboard() { 
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast,setToast] = useState<boolean>(false);
  const [toastmsg, setToastmsg] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<"success" | "error">("success");
  const [pagina, setPagina] = useState<number>(1);
  const [n_paginas, setN_Paginas] = useState<number>(1);


  const setPages = (total_users:number) => {
    const pages = Math.ceil(total_users / 5);
    setN_Paginas(pages);
  }


  const makeToast = (message: string,status: "success" | "error") => {
    setToastmsg(message);
    setToastStatus(status);
    setTimeout(() => setToastmsg(null), 3000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    const performFetch = async () => {  
      const response = await fetch(`/api/admin/registered?pagina=${pagina}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
      });
      if (response.status === 401) {
        const refresh = await fetch(`/api/admin/auth/refresh`, {
          method: "GET",
          credentials: "include",
        });
        if (refresh.ok) {
          const retryResponse = await fetch(`/api/admin/registered?pagina=${pagina}`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              credentials: 'include',
            },
          });
          if (!retryResponse.ok) {
            throw new Error("Error al cargar los usuarios registrados");
          }
          return null; 
        }
      }else if (!response.ok) {
        throw new Error("Error al cargar los usuarios registrados");
      }
      return response;
    }
    try {
      const res = await performFetch();
      if (res === null) return; 
      const data = await res.json();
      setData(data.users);
      setPages(data.total);
    } catch (error) {
      console.error("Error al cargar los usuarios registrados:", error);
    } finally {
      setLoading(false);
    }
    
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar, pagina]);

  const handleUpdated = async () => {
    await cargar();
    setLoading(false);
  };


  const chagePage = async (newPagina: number) => {
    const bounded = Math.min(Math.max(newPagina, 1), n_paginas);
    setPagina(bounded);
    await handleUpdated();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className='p-6 w-full min-h-screen '>
  
      {toast ? <Toast message={toastmsg as string} status={toastStatus} /> : null}
      <div className='bg-white shadow-md rounded-lg h-lvh flex flex-col justify-center items-center'>
        <div className="w-full max-w-4xl">
          <h1 className='text-3xl font-bold'>Panel de Administración</h1>
          <p>Bienvenido al panel de administración.</p> 
          <div className="flex flex-row gap-20 ">
            <div className="grid grid-cols-3 gap-4 text-white mt-24">
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={() => navigate("/noticias")}> Administrar Noticias </button>
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={()=>navigate("/proyectos")} >  Administrar Proyectos</button>
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={() => navigate("/admin-practicas")}>Administrar Practicas</button>         
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={() => navigate("/workshop")}>Administrar Workshops</button>
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={() => navigate("/tesis")}>Administrar Tesis</button>  
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={() => navigate("/becados")}>Administrar Becados</button>
              <button className='w-40 h-40 bg-orange-400 rounded-2xl text-xl hover:bg-slate-700' onClick={() => navigate("/gira")}>Administrar Gira</button>           
            </div>
            <div className="span-col-2 mt-6 flex flex-col gap-4">
              <div className="flex flex-col items-center">
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
              {!loading && n_paginas > 1 && (
                <div className="flex flex-col bg-gray-800/40 items-center rounded-3xl">
                  <div className="flex flex-row items-center gap-4 m-2">
                    <button
                      onClick={() => chagePage(pagina - 1)}
                      disabled={pagina === 1}
                      className="rounded-2xl text-white bg-orange-400 disabled:bg-gray-700 hover:bg-orange-500 w-20 h-12 shadow-2xl"
                    >
                      Anterior
                    </button>
                    <span className="font-bold text-white">
                      Página {pagina} de {n_paginas}
                    </span>
                    <button
                      onClick={() => chagePage(pagina + 1)}
                      disabled={pagina === n_paginas}
                      className="text-xl rounded-2xl text-white bg-orange-500 disabled:bg-gray-700 hover:bg-orange-600 w-20 h-12 shadow-2xl"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
        
      </div>
    
    </main>
  );
} 
  