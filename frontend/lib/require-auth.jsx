'use client';

import { useAuth } from './auth-context';

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return children;
}