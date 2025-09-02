import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './index.css'
import Home from './Pages/Home';
import Practicas from './Pages/Practicas';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practicas" element={<Practicas />} />
      </Routes>
    </Router>
    
  </StrictMode>,
)
