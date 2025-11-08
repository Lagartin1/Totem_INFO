



export default function cardPracticas({titulo,empresa,date, id,onClickDelete,showToast ,showloading}: {titulo: string, id: string, empresa: string, date?: string , onClickDelete: () => Promise<void>,showToast: (message: string, type: "success" | "error") => void, showloading: (state: boolean) => void}) { 
  
  const onDelete = async () => {
    showloading(true);
    fetch("/api/admin/administrar/practicas", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          // Eliminación exitosa
          showToast("Práctica eliminada exitosamente.", "success");
        } else {
          showToast(`Error al eliminar la práctica: ${data.message}`, "error");
        }
      }).finally(async () => {
        await onClickDelete();
      });
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-center items-center space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
          <p className="text-gray-600">Empresa: {empresa}</p>
          <p className="text-gray-600" >Agregado el: {date}</p>
        </div>
        <div className='flex space-x-4 justify-center mt-4 sm:flex-col sm:space-x-0 sm:space-y-4'>
          <button className='bg-red-400 text-white px-4 py-2 rounded-md  h-20 text-2xl hover:bg-red-700'onClick={onDelete} >Eliminar Practica</button>
          <button className='bg-yellow-300 text-black px-4 py-2 rounded-md  h-20 text-2xl hover:bg-yellow-500'>Cambiar Estado</button>
        </div>
      </div>
    </>
  );
}