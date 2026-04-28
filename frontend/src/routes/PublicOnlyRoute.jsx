import { Navigate } from "react-router-dom";

import { useAuth } from "../providers/useAuth";

function PublicOnlyRoute({ children }) {
  // Logged-in users should not see login/register forms again.
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicOnlyRoute;
