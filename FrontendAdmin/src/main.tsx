import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'    
import Home from './pages/Login';
import Dashboard from './pages/dashboard';
import { AuthProvider } from './lib/authProvider';
import ProtectedRoute from './routes/protectedRoutes';
import LoadData from './pages/loadData';
import AdminPracticas from './pages/adminPracticas';
import NotFound from './pages/404';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/load-data" element={<LoadData />} />
            <Route path="/admin-practicas" element={<AdminPracticas />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
)
