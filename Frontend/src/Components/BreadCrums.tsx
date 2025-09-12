import { Link, useLocation } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline"

function Breadcrumbs() {
  const location = useLocation();

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

          const label = value;
          const formattedLabel = label.replace(/-/g, ' ').charAt(0).toUpperCase() + label.replace(/-/g, ' ').slice(1);

          return (
            <li key={to} className="flex items-center gap-2">
              <ChevronRightIcon className="w-4 h-4" />
              {!isLast ? (
                <Link to={to}>{formattedLabel}</Link>
              ) : (
                <span className="text-gray-800 font-medium">{formattedLabel}</span>
              )}
            </li>
            
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
