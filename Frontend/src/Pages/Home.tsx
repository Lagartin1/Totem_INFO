import Boton_Landing from "../Components/Boton_Landing";
import Header from "../Components/Header";
import NoticiasSection from "../Components/Noticias_Section";
import NavBar from "../Components/NavBar";


function Home() {
  return (
    
      <main className="min-h-screen w-full flex flex-col items-center bg-white-500">

          <NavBar />
            <div className="container flex flex-col">
              <NoticiasSection />
            </div>

      </main> 

  );
}

export default Home;
