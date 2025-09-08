import Header from "../Components/Header";
import Card_Proyectos from "../Components/Card_Proyect";
import Search_Bar from "../Components/Search_Bar";
import Carousel from "../Components/Carousel";


export default function ProyectosDocentes() {
  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <Header />
      <div className="py-10">
        {/* Barra de búsqueda */}
        <Search_Bar />
        {/* Carrusel de tarjetas */}
        <div className="relative ">
          <div className="flex overflow-x-auto gap-6 pb-3 scroll-smooth snap-x snap-mandatory scrollbar-hide">
            {[1, 2, 3, 4, 5, 6].map((card) => (
              <Card_Proyectos key={card} card={card} />
            ))}
          </div>
        </div>
      </div>
      
    </main>
  );
}
