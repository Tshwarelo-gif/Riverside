import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../lib/auth-context";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isStaff, isLoading, profile } = useAuth();

  if (isLoading) {
    return <div className="px-6 py-16 text-center text-ink/50">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // profile === null while it's still being fetched right after login;
  // only redirect once we're sure it's loaded and genuinely not staff.
  if (profile && !isStaff) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
