import { useNavigate } from "react-router-dom";

interface BotonProps {
  Title: string;
  Link?: string;
  onClick?: () => void;
  page?: number;
}

function Boton_Landing({ Title, Link, onClick, page }: BotonProps) {
  if (Link) {
    const navigate = useNavigate();

    const handleClick = () => {
      if (page !== undefined) {
        navigate(Link, { state: { n_pagina: page } });
      } else {
        navigate(Link);
      }
    };

    return (
      <div
        className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer"
        onClick={handleClick}>
        <h3 className=" text-balance text-2xl p-5 text-white">{Title}</h3>
      </div>
    );
  } else {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-center rounded-2xl p-10 w-60 h-40 bg-gray-700 shadow-2xl shadow-gray-500 cursor-pointer">
        <h3 className=" text-balance text-2xl p-5 text-white">{Title}</h3>
      </button>
    );
  }
}

export default Boton_Landing;
