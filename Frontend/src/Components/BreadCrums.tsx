import { Link, useLocation } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline"

function Breadcrumbs() {
  const location = useLocation();

  // Diccionario para reemplazar palabras por su versión con tildes o caracteres especiales
  const translations: Record<string, string> = {
    practicas: "Prácticas",
    "practicas-profesionales": "Prácticas Profesionales",
    "practicas-iniciales": "Prácticas Iniciales",
    tesis: "Tésis",
    proyectos: "Proyectos",
  };

  // Dividimos la URL en partes
  const pathnames = location.pathname.split("/").filter((x) => x);

  // No mostrar breadcrumbs en la página de inicio
  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="p-3">
      <ol className="flex items-center gap-2 text-gray-800">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          // Formateamos la etiqueta con espacios y mayúsculas
          const label = value.replace(/-/g, " ");
          const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

          // Si existe traducción, la usamos
          const finalLabel = translations[value.toLowerCase()] || formattedLabel;

          return (
            <li key={to} className="flex items-center gap-2">
              <ChevronRightIcon className="w-4 h-4" />
              {!isLast ? (
                <Link to={to}>{finalLabel}</Link>
              ) : (
                <span className="text-gray-800 font-medium">{finalLabel}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
