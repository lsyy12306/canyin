import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../store/auth';

/** 受保护路由：无 token 则重定向到 /login，并携带来源路径 */
export default function ProtectedRoute() {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
