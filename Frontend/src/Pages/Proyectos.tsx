import Header from "../Components/Header";
import Card_Proyectos from "../Components/Card_Proyect";
import Search_Bar from "../Components/Search_Bar";
import Carousel from "../Components/Carousel";

export default function ProyectosDocentes() {
  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 px-4">
        Home &gt;{" "}
        <span className="text-gray-700 font-medium">Proyectos Docentes</span>
      </div>

      {/* Barra de búsqueda */}
      <Search_Bar />

      {/* Carrusel de tarjetas */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-6 pb-4 scroll-smooth snap-x snap-mandatory">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <Card_Proyectos key={card} card={card} />
          ))}
        </div>
      </div>

      {/* <Carousel images={["/UACH1.jpg", "/UACH2.jpg", "/UACH3.jpg"]} /> */}
    </div>
  );
}
