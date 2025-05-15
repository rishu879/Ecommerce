import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useStore();
  const location = useLocation();
  
  if (!user) {
    // Redirect to login page if not authenticated,
    // but save the current path to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;