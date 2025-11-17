export default function UserCard({
  id,
  nombre,
  apellido,
  username,
  email,
  onUpdated,
  showToast,
}: {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  onUpdated: () => Promise<void>;
  showToast: (message: string, type: "success" | "error") => void;
}) {
  const authNewUser = async () => {
    const tryAuth = async () => {
      const response = await fetch(`/api/admin/registered/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: id }),
      });
      return response;
    };

    try {
      let response = await tryAuth();
      if (response.status === 401) {
        await fetch("/api/auth/refresh", {
          method: "GET",
          credentials: "include",
        });
        response = await tryAuth();
        if (response.status === 401) {
          window.location.href = "/";
          return;
        }
      }
      if (!response.ok) {
        showToast("Error al autorizar el usuario.", "error");
        return;
      }
      showToast("Usuario autorizado exitosamente.", "success");
    } catch (error) {
      showToast("Error al autorizar el usuario.", "error");
    } finally {
      await onUpdated();
    }
  };

  return (
    <div
      id={id}
      className="p-4 rounded shadow-md w-100 flex flex-row gap-2 bg-[#5fa9ef] text-white">
      <div className="">
        <h2 className="font-bold text-lg">
          {nombre} {apellido}
        </h2>
        <p className="">@{username}</p>
        <p className="">{email}</p>
      </div>
      <div className="flex-grow flex items-center justify-end">
        <button
          onClick={authNewUser}
          className="p-2 rounded-tl-sm rounded-bl-sm rounded-br-2xl rounded-tr-2xl bg-amber-400 hover:bg-amber-500 text-white font-semibold self-center">
          Autorizar
        </button>
      </div>
    </div>
  );
}
