import { useEffect, useState } from "react";

import { useUser } from "@stackframe/react";

import { AuthContext } from "@/contexts/auth-context";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccessToken = async () => {
      if (user) {
        setAccessToken((await user.getAuthJson()).accessToken);
      }
      setIsLoading(false);
    };

    fetchAccessToken();

    const intervalId = setInterval(fetchAccessToken, 1000 * 60);

    return () => clearInterval(intervalId);
  }, [user]);

  if (isLoading) {
    return null;
  }

  const authValue = {
    accessToken,
    userId: user?.id || null,
    user,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
} 