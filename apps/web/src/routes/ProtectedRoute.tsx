import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}