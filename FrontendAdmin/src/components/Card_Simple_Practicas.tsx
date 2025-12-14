import React from "react";
import IndicadorCard from "./IndicadorCard";

export default function cardPracticas({
  titulo,
  empresa,
  date,
  estado,
  id,
  onUpdate,
  showToast,
  showloading,
}: {
  titulo: string;
  id: string;
  empresa: string;
  date?: string;
  estado: boolean;
  onUpdate: () => Promise<void>;
  showToast: (message: string, type: "success" | "error") => void;
  showloading: (state: boolean) => void;
}) {
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [stateModal, setStateModal] = React.useState(false);

  const [stateObj, setStateObj] = React.useState(!estado);

  const onDelete = async () => {
    showloading(true);
    const performDelete = async () => {
      const response = await fetch("/api/admin/administrar/practicas", {
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
          return await fetch("/api/admin/administrar/practicas", {
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
    try {
      const response = await performDelete();
      const data = await response.json();

      if (data.ok) {
        setDeleteModal(false);
        showToast("Práctica eliminada exitosamente.", "success");
      } else {
        setDeleteModal(false);
        showToast(`Error al eliminar la práctica: ${data.message}`, "error");
      }
    } catch (error) {
      showToast("Error de conexión al eliminar la práctica.", "error");
    } finally {
      await onUpdate();
    }
  };

  const onClickEliminar = () => {
    setDeleteModal(true);
  };

  const onChangeState = async () => {
    showloading(true);
    const performStateChange = async () => {
      const response = await fetch("/api/admin/administrar/practicas/state", {
        method: "PUT",
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
          return await fetch("/api/admin/administrar/practicas/state", {
            method: "PUT",
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

    try {
      const response = await performStateChange();
      const data = await response.json();

      if (data.ok) {
        setStateModal(false);
        setStateObj(!stateObj);
        showToast("Estado de la práctica actualizado exitosamente.", "success");
      } else {
        showToast(
          `Error al actualizar el estado de la práctica: ${data.message}`,
          "error"
        );
      }
    } catch (error) {
      showToast(
        "Error de conexión al actualizar el estado de la práctica.",
        "error"
      );
    } finally {
      await onUpdate();
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-center items-center space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
          <p className="text-gray-600">Empresa: {empresa}</p>
          <p className="text-gray-600">Agregado el: {date}</p>
        </div>
        <div className="flex space-x-4 justify-center mt-4 sm:flex-col sm:space-x-0 sm:space-y-4">
          <button
            className="bg-red-400 text-white px-4 py-2 rounded-md  h-20 text-2xl hover:bg-red-700"
            onClick={onClickEliminar}>
            Eliminar Practica
          </button>
          <button
            className="bg-yellow-400 text-black px-4 py-2 rounded-md  h-20 text-2xl hover:bg-yellow-500 disabled:bg-gray-400"
            disabled={stateObj}
            onClick={() => setStateModal(true)}>
            Desactivar Práctica
          </button>
        </div>

        {deleteModal && (
          <div
            className="fixed inset-0 bg-black/5 w-full h-full top-1/2 left-1/2 
                          transform -translate-x-1/2 -translate-y-1/2 transition 
                          ease-out inset backdrop-blur-sm flex items-center justify-center z-50 ">
            <div className="flex flex-col h-40 w-80 bg-white rounded-xl text-justify items-center p-6">
              <h2 className="text-xl font-semibold mb-4">
                Confirmar Eliminación
              </h2>
              <p className="mb-6">
                ¿Estás seguro de que deseas eliminar esta práctica?
              </p>
              <div className="flex space-x-4">
                <button
                  className="bg-green-400 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  onClick={onDelete}>
                  Eliminar
                </button>
                <button
                  className="bg-red-400 text-black px-4 py-2 rounded-md hover:bg-red-500"
                  onClick={() => setDeleteModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {stateModal && (
          <div
            className="fixed inset-0 bg-black/10 w-full h-full top-1/2 left-1/2 
                          transform -translate-x-1/2 -translate-y-1/2 transition 
                          ease-out inset backdrop-blur-sm flex items-center justify-center z-50 ">
            <div className="flex flex-col h-[30vh] w-[40vw] bg-white rounded-xl text-justify items-center p-6">
              <h2 className="text-xl font-semibold mb-4">Cambiar Estado</h2>
              <div className="flex flex-row gap-3">
                <p>El</p>
                <IndicadorCard value={estado} />
              </div>
              <p className="mb-1">
                ¿Deseas cambiar el estado de esta práctica?
              </p>
              <div className="flex flex-row gap-1 mb-10">
                <p>El nuevo estado de la práctica será:</p>
                <p className="font-semibold">
                  {estado ? "Inactiva" : "Activa"}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  onClick={() => setStateModal(false)}>
                  Volver atrás
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  onClick={onChangeState}>
                  Cambiar Estado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
