import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { authStore } from '../../stores/authStore';
import type { Role } from '../../types';

interface Props {
  requiredRole?: Role;
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { user } = useStore(authStore);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
