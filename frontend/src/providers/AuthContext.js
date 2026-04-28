import { createContext } from "react";

// Shared auth context consumed through useAuth() instead of importing React context directly.
export const AuthContext = createContext(null);
