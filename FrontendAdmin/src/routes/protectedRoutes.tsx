
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authProvider';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="p-6 text-center">Cargando…</div>;
  if (!isAuthenticated) {
    // guarda a dónde quería ir
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
