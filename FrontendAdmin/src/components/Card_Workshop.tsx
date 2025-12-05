import React from 'react';

interface CardWorkshopProps {
  id: string;
  titulo: string;
  link: string;
  descripcion: string;
}

export default function CardWorkshop({ id, titulo, link, descripcion, onUpdate,showToast,showLoader }: CardWorkshopProps & { onUpdate: () => Promise<void> }& { showToast: (message: string, type: "success" | "error") => void} & { showLoader: (state: boolean) => void}) {
  const [modal, setModal] = React.useState(false);
  const [ensurment, setEnsurment] = React.useState<boolean>(false);
  const [ensureEvent, setEnsureEvent] = React.useState<string>(''); 
  const [props, setProps] = React.useState({titulo, link, descripcion });
  const [editable, setEditable] = React.useState(false);

  const onAccept = () => {
    showLoader(true);
    if (ensureEvent === 'Eliminar') {
      deleteWorkshop();
    } else if (ensureEvent === 'Guardar') {
      saveChanges();
    }    
  }

  const saveChanges = async () => {
    const performUpdate = async () => {
      const response = await fetch("/api/workshops", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id, ...props }),
      });
      
      if (response.status === 401) {
        const refreshResponse = await fetch("/api/admin/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        
        if (refreshResponse.ok) {
          return await fetch("/api/workshops", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ id, ...props }),
          });
        }
      } 
      return response;
    };
    try{
      const response = await performUpdate();
      const data = await response.json();
      if (data.ok) {
        setEnsurment(false);
        showToast("Workshop actualizado exitosamente.", "success");
        onUpdate();
      } else {
        setEnsurment(false);
        showToast(`Error al actualizar el workshop: ${data.message}`, "error");
      }
    } catch (error) {
      setEnsurment(false);
      showToast("Error al actualizar el workshop.", "error"); 
    } finally {
      await onUpdate();
    }
  }

  const deleteWorkshop = async () => {
    const performDelete = async () => {
      const response = await fetch("/api/workshops", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      
      if (response.status === 401) {
        const refreshResponse = await fetch("/api/admin/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        
        if (refreshResponse.ok) {
          return await fetch("/api/workshops", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ id }),
          });
        }
      }  
      return response;
    };
    try{
      const response = await performDelete();
      const data = await response.json();
      if (data.ok) {
        setEnsurment(false);
        showToast("Workshop eliminado exitosamente.", "success");
        onUpdate();
      } else {
        setEnsurment(false);
        showToast(`Error al eliminar el workshop: ${data.message}`, "error");
      }
    } catch (error) {
      setEnsurment(false);
      showToast("Error al eliminar el workshop.", "error"); 
    } finally {
      await onUpdate();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProps((prevProps) => ({
      ...prevProps,
      [name]: value,
    }));
  }
  const onClick = () => {
    setModal(!modal);
  }

  const onClose = () => {
    onCancel();
    setModal(false);
  }
  const onSave = () => {
    setEnsureEvent('Guardar');
    setEnsurment(true);
    setEditable(false);
  }

  const onEdit = () => {
    setEditable(!editable);
  }
  const onCancel = () => {
    setProps({ titulo, link, descripcion });
    setEditable(!editable);
  }
  const onClickDelete = () => {
    setEnsureEvent('Eliminar');
    setEnsurment(true);
  }

  return (
    <div key={id} className="flex flex-col rounded-lg border border-gray-300 p-4 shadow-md 
                    hover:shadow-lg sm:justify-between 
                    hover:border-blue-500 transition-shadow-ease-out 
                    transition-colors-ease-out duration-300 ">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <button 
      
        className='mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 p-2 cursor-pointer'
        onClick={onClick}
      >
        Ver Detalles
      </button>

      {modal&&ensurment?(
        <div className="fixed inset-0 bg-black/20 w-full h-full top-1/2 left-1/2 
                              transform -translate-x-1/2 -translate-y-1/2 transition 
                              ease-out inset backdrop-blur-sm flex items-center justify-center z-50 ">
        <div className='flex flex-col  bg-white rounded-xl text-justify items-center p-6'>
          <h2 className="text-xl font-semibold mb-4">{ensureEvent} Workshop</h2>
          <p className="mb-6">¿Estás seguro de que deseas {ensureEvent.toLocaleLowerCase()} este workshop?</p>
          <div className='flex space-x-4'>
            {ensureEvent === 'Eliminar' && (
              <button 
                className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600' 
                onClick={onAccept}
              >
                Eliminar
              </button>
            )}
            {ensureEvent === 'Guardar' && (
              <button 
                className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600' 
                onClick={onAccept}
              >
                Guardar Cambios
              </button>
            )}
            <button 
              className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600' 
              onClick={() => setEnsurment(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      ):null}
      
      {modal && (
              <div className="fixed inset-0 bg-black/15 w-full h-full top-1/2 left-1/2 
                              transform -translate-x-1/2 -translate-y-1/2 transition 
                              ease-out inset backdrop-blur-sm flex items-center justify-center z-40 ">
                <div className='flex flex-col h-[60vh] w-[50vw] bg-white rounded-xl text-justify items-center p-6'>
                  <h2 className="text-xl font-semibold mb-4">Información Workshop</h2>
                  <div className="p-10 grid grid-cols-2 grid-rows-1 gap-2 items-start">
                    <div className="col-span-0 ">
                        <form className="space-y-4 mb-2" >
                        <div >
                          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                            overflow-x-auto whitespace-nowrap cursor-text"
                            placeholder="Título del workshop"
                            disabled={!editable}
                            value={props.titulo}
                            onChange={onChange}
                          />

                        </div>
                        <div>
                          <label htmlFor="link_video" className="block text-sm font-medium text-gray-700 mb-1">
                            Link Video
                          </label>
                          <input
                            type="text"
                            id="link"
                            name="link"
                            className="w-full px-3 py-2 pl-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                             overflow-x-auto whitespace-nowrap cursor-text"
                            placeholder="Link del video del workshop"
                            disabled={!editable}
                            value={props.link}
                            onChange={onChange}
                          />
                        </div>
                        <div >
                          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <textarea
                            id="descripcion"
                            name="descripcion"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                             overflow-x-auto cursor-text"
                            placeholder="Descripción del workshop"
                            disabled={!editable}
                            value={props.descripcion}
                            onChange={onChange}

                          />
                        </div>
                        {modal && editable ?
                        <div id="formbuttons" className="flex flex-row gap-4 items-center justify-center">
                            <button 
                              type="button"
                              className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600' 
                              onClick={onCancel}
                            >
                              Descartar
                            </button>
                            <button 
                              type="button"
                              className=' bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
                              onClick={onSave}
                            >
                              Guardar
                            </button>
                        </div>  
                        : null}                    
                      </form>
                    </div>
                    <div className="flex flex-col p-20 col-span-1 gap-5">
                    <button 
                      className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600' 
                      onClick={onClickDelete}
                    >
                      Eliminar
                    </button>
                    <button 
                      className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400' 
                      disabled={editable}
                      onClick={onEdit}
                    >
                      Editar
                    </button>
                    <button 
                      className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600' 
                      onClick={onClose}
                    >
                      Volver atrás
                    </button>
                  </div>

                  </div>                    
                </div>
              </div>
            )}
    </div>
);
}