import Boton_Landing from "../Components/Boton_Landing"
import Header from "../Components/Header"
import Carousel from "../Components/Carousel"

function Home() {

  return (
    <main className='min-h-screen w-full flex flex-col items-center bg-white-500'>
      <Header/>
      <div className="container flex flex-col">
          <div className="items-center grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 p-20">
            <Boton_Landing Title="Practicas" Link="/practicas"/>
            <Boton_Landing Title="Tesis" Link="/tesis"/>
            <Boton_Landing Title="Proyectos" Link="/proyectos"/>
            <Boton_Landing Title="Becados" Link="/becados"/>
          </div>
          <Carousel images={["/UACH1.jpg", "/UACH2.jpg", "/UACH3.jpg"]} />
        </div>
    </main>
  )
}

export default Home
