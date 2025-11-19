import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./lib/authProvider";
import ProtectedRoute from "./routes/protectedRoutes";
import AdminPracticas from "./pages/AdminPracticas";
import PracticasExistentes from "./pages/PracticasExistentes";
import NotFound from "./pages/404";
import NoticiasSection from "./pages/Noticias";
import Workshop from "./pages/Workshop";
import Proyectos from "./pages/Proyectos";
import TopPracticas from "./pages/TopPracticas";
import Becados from "./pages/Becados";
import Tesis from "./pages/AdminTesis";
import TopTesis from "./pages/TopTesis";
import Gira from "./pages/Gira";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Router basename="/admin">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}></Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/noticias" element={<NoticiasSection />} />
          <Route path="/becados" element={<Becados />} />
          <Route path="/gira" element={<Gira />} />
          <Route path="/admin-practicas" element={<AdminPracticas />} />
          <Route
            path="/admin-practicas/practicas/top-visitadas"
            element={<TopPracticas />}
          />
          <Route
            path="/admin-practicas/:type"
            element={<PracticasExistentes />}
          />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/tesis" element={<Tesis />} />
          <Route path="/tesis/top-visitadas" element={<TopTesis />} />
          <Route path="/gira" element={<Gira />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
