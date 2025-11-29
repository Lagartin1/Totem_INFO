import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import Home from './Pages/Home';
import Becados from './Pages/Becados';
import Proyectos from './Pages/Proyectos';
import Practicas from './Pages/Practicas';
import Workshops from './Pages/Workshops';
import Giras from './Pages/Giras';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/becados" element={<Becados />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/practicas/:type" element={<Practicas/>} /> 
        <Route path="/proyectos/:type" element={<Proyectos/>} />
        <Route path="/workshops" element={<Workshops />} /> 
        <Route path="/giras" element={<Giras />} />
      </Routes>
    </Router>
    
  </StrictMode>,
)
