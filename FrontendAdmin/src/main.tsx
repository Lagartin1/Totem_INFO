import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Login";
import Dashboard from "./pages/dashboard";
import { AuthProvider } from "./lib/authProvider";
import ProtectedRoute from "./routes/protectedRoutes";
import AdminPracticas from "./pages/adminPracticas";
import PracticasExistentes from "./pages/practicasExistentes";
import NotFound from "./pages/404";
import NoticiasSection from "./pages/Noticias";
import Workshop from "./pages/workshop";
import Proyectos from "./pages/proyectos";
import TopPracticas from './pages/TopPracticas';
import Becados from "./pages/becados";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Router basename="/admin">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-practicas" element={<AdminPracticas />} />
            <Route path="/admin-practicas/:type" element={<PracticasExistentes />} />
            <Route path="/admin-practicas/top-visitadas" element={<TopPracticas />} />
            <Route path="/workshop" element={<Workshop />} />
            <Route path="/proyectos" element={<Proyectos />} />
            <Route path="/noticias" element={<NoticiasSection />} />
            <Route path="/becados" element={<Becados />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
