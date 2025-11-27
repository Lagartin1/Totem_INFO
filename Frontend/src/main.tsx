import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import Home from './Pages/Home';
import Becados from './Pages/Becados';
import Proyectos from './Pages/Proyectos';
import Practicas from './Pages/Practicas';
import Tesis from './Pages/Tesis';
import Workshops from './Pages/Workshops';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/becados" element={<Becados />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/practicas/:type" element={<Practicas/>} /> 
        <Route path="/tesis" element={<Tesis />} />
        <Route path="/workshops" element={<Workshops />} /> 
  
      </Routes>
    </Router>
    
  </StrictMode>,
)
