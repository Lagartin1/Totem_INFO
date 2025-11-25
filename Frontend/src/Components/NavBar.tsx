import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo_uach from "../assets/logoUach.png";
import logo_inf from "../assets/UACh_Informatica.png";




export default function NavBar() {
  const navigate = useNavigate();
  const [modalList, setModalList] =  useState(false);
  const onClickModalList = () => {
    setModalList(!modalList);
  }

  return (
    <header className=" w-full flex flex-col items-center py-4 px-6 z-50">
        <nav className="relative top-10 w-4/5 h-30 bg-white/70 flex items-center  rounded-4xl justify-start shadow-md z-50">
          <img src={logo_uach} alt="Logo UACh" className="h-20 pl-5" />
          <img
            src={logo_inf}
            alt="Logo UACh Informatica"
            className="h-15 pl-5 pr-10"
          />
          <ul> 
            <li className="inline-block mx-6">
                <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/")}>
                  Inicio
                </a>
            </li>
            <li className="inline-block mx-4">
              <button className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={onClickModalList}>
                Prácticas
              </button>
              { modalList && (  
                <div className="absolute top-20 left-115s bg-white/70 border border-gray-300 rounded-lg shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <a 
                        className="block px-4 py-2 hover:bg-gray-100 text-2xl font-semibold"
                        onClick={() => {
                          navigate("/practicas/practicas-profesionales");
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
                          navigate("/practicas/practicas-iniciales");
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
              <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/tesis")}>
                Tesis
              </a>
            </li>
            <li className="inline-block mx-4">
              <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/proyectos")}>
                Proyectos
              </a>
            </li>
            <li className="inline-block mx-4">
              <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/becados")}>
                Becados
              </a>
            </li>
            <li className="inline-block mx-4">
              <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/workshops")}>
                Workshops
              </a>
            </li>
            <li className="inline-block mx-4">
              <a className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-300" onClick={() => navigate("/workshops")}>
                Gira estudios
              </a>
            </li> 
          </ul>
          
        </nav>
    </header>
  );
}