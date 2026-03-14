import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../logic/useAuthStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAnonymous, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-label text-primary">Authenticating...</p>
      </div>
    );
  }

  if (!user || isAnonymous) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
