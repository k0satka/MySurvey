import { useContext } from "react";

import { AuthContext } from "./AuthContext";

export function useAuth() {
  // Small guard so auth hooks fail loudly if used outside AuthProvider.
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
