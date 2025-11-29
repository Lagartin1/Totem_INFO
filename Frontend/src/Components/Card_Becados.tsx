import React from "react";

interface BecadoProps {
  nombre: string;
  apellido: string;
  carrera: string;
  universidad: string;
  image?: string;
}

export default function CardBecados(props: BecadoProps) {
  const [modal, setModal] = React.useState<boolean>(false);
  const prevOverflowRef = React.useRef<string>("");

  const performClick = () => {
    setModal(true);
  };

  React.useEffect(() => {
    if (modal) {
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prevOverflowRef.current || "";
    }
    return () => {
      document.body.style.overflow = prevOverflowRef.current || "";
    };
  }, [modal]);

  const shortText = (text?: string, maxLength: number = 100) => {
    const t = text ?? "";
    if (t.length > maxLength) {
      return t.slice(0, maxLength) + "...";
    }
    return t;
  };

  // Imagen por defecto si no se proporciona una
  const defaultImage =
    "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Becado";
  const imageUrl = props.image || defaultImage;

  return (
    <>
      <div
        role="button"
        onClick={performClick}
        className={`rounded-lg p-4 shadow-md 
          hover:shadow-lg transition-shadow-ease-out transition-colors-ease-out duration-300
          h-90 w-80 flex flex-col justify-end items-center cursor-pointer relative bg-gradient-to-br from-blue-500 to-purple-600`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        <div className="absolute bg-gradient-to-t from-black/70 to-transparent text-lg font-semibold inset-0 z-10 overflow-hidden rounded-lg">
          <div className="absolute bottom-5 left-5 right-5">
            <h1 className="text-xl font-bold text-white mb-1">
              {props.nombre} {props.apellido}
            </h1>
            <p className="text-sm text-white/90">
              {shortText(props.carrera, 50)}
            </p>
            <p className="text-xs text-white/80 mt-1">
              {shortText(props.universidad, 40)}
            </p>
          </div>
        </div>
      </div>

      {modal && (
        <div>
          <div
            className="fixed inset-0 bg-black/50 w-full h-full top-1/2 left-1/2 
                          transform -translate-x-1/2 -translate-y-1/2 transition 
                          ease-out inset backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex h-[70vh] w-[80vw] bg-white rounded-xl flex-row items-center relative shadow-2xl">
              {/* Imagen del becado */}
              <div className="w-[40%] h-full relative">
                <img
                  src={imageUrl}
                  alt={`${props.nombre} ${props.apellido}`}
                  className="w-full h-full object-cover rounded-l-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 rounded-l-xl"></div>
              </div>

              {/* Información del becado */}
              <div className="flex flex-col w-[60%] p-8 h-full justify-center">
                <div className="text-center mb-8">
                  <h1 className="font-bold text-4xl text-gray-800 mb-2">
                    {props.nombre} {props.apellido}
                  </h1>
                  <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Carrera
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {props.carrera}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Universidad
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {props.universidad}
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Becado Activo</span>
                  </div>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
                onClick={() => setModal(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-6 w-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
