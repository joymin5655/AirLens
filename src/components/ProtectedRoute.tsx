import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../logic/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-label text-primary font-black uppercase tracking-[0.3em]">Identity Verification</p>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Connecting to AirLens Core...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
