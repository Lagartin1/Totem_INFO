import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo_uach from "../assets/logoUach.png";
import logo_inf from "../assets/UACh_Informatica.png";




export default function NavBar() {
  const navigate = useNavigate();
  const [modalList, setModalList] =  useState(false);
  const [modalList2, setModalList2] =  useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modal2Ref = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const button2Ref = useRef<HTMLButtonElement | null>(null);
  const onClickModalList = (e?: React.MouseEvent<HTMLElement>) => {
    
    e?.preventDefault();
    setModalList(!modalList);
  };
  const onClick2dModalList = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    setModalList2(!modalList2);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        modalList &&
        modalRef.current &&
        !modalRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setModalList(false);
      }
      if (
        modalList2 &&
        modal2Ref.current &&
        !modal2Ref.current.contains(target) &&
        button2Ref.current &&
        !button2Ref.current.contains(target)
      ) {
        setModalList2(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalList, modalList2]);


  return (
    <header className=" w-full flex flex-col items-center py-4 px-6 z-50">
        <nav className="relative top-10 w-4/5 h-30 bg-white/70 flex items-center  rounded-4xl justify-start shadow-md z-[9999]">
          <img src={logo_uach} alt="Logo UACh" className="h-20 pl-5" onClick={() => navigate("/")} />
          <img
            src={logo_inf}
            alt="Logo UACh Informatica"
            className="h-15 pl-5 pr-10" onClick={() => navigate("/")}
          />
          <ul> 
            <li className="inline-block mx-6">
                <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/")}>
                  Inicio
                </a>
            </li>
            <li className="inline-block mx-4">
              <button ref={buttonRef} className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={onClickModalList}>
                Prácticas
              </button>
              { modalList && (  
                <div ref={modalRef} className="absolute top-20 left-115s bg-white/70 border border-gray-300 rounded-lg shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <a 
                        className="block px-4 py-2 hover:bg-gray-100 text-2xl font-semibold"
                        onClick={() => {
                          navigate("/practicas/profesionales");
                          onClickModalList();
                        } 
                      }>
                        Prácticas Profesionales
                      </a>
                    </li>
                    <li>
                      <a 
                        className="block px-4 py-2 hover:bg-gray-100 text-2xl font-semibold"
                        onClick={() => {
                          navigate("/practicas/iniciales");
                          onClickModalList();
                        } 
                      }
                      >
                        Práctica Inicial
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li className="inline-block mx-4">
              <button ref={button2Ref} className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={onClick2dModalList}>
                Proyectos
              </button>
              { modalList2 && ( 
                <div ref={modal2Ref} className="absolute top-20 left-145s bg-white/70 border border-gray-300 rounded-lg shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <a 
                        className="block px-4 py-2 hover:bg-gray-100 text-2xl font-semibold"
                        onClick={() => {
                          navigate("/proyectos/profesores");
                          onClick2dModalList();
                        } 
                      }>
                        Proyectos de Profesores
                      </a>
                    </li>
                    <li>
                      <a 
                        className="block px-4 py-2 hover:bg-gray-100 text-2xl font-semibold"
                        onClick={() => {
                          navigate("/proyectos/estudiantes");
                          onClick2dModalList();
                        } 
                      }
                      >
                        Proyectos de Estudiantes
                      </a>
                    </li>
                  </ul>
                </div>  
              )}
            </li>
            <li className="inline-block mx-4">
              <button className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/becados")}>
                Becados
              </button>
            </li>
            <li className="inline-block mx-4">
              <button className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/workshops")}>
                Workshops
              </button>
            </li>
            <li className="inline-block mx-4">
              <button className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/giras")}>
                Gira estudios
              </button>
            </li> 
          </ul>
          
        </nav>
    </header>
  );
}