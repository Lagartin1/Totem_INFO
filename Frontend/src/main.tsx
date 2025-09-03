import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './index.css'
import Home from './Pages/Home';
import Practicas from './Pages/Practicas';
import Becados from './Pages/Becados';
import Proyectos from './Pages/Proyectos';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practicas" element={<Practicas />} />
        <Route path="/becados" element={<Becados />} />
        <Route path="/proyectos" element={<Proyectos />} />
      </Routes>
    </Router>
    
  </StrictMode>,
)
