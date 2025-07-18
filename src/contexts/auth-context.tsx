import { createContext, useContext } from "react";

import { useUser } from "@stackframe/react";

interface AuthContextType {
  accessToken: string | null;
  userId: string | null;
  user: ReturnType<typeof useUser>;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  userId: null,
  user: null,
});

// Convenience hooks
export const useAuth = () => useContext(AuthContext);
export const useAccessToken = () => useContext(AuthContext).accessToken;
export const useUserId = () => useContext(AuthContext).userId;
export const useCurrentUser = () => useContext(AuthContext).user; 