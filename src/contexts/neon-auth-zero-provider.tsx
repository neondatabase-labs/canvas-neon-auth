import React, { useEffect, useState, useMemo } from 'react';

import { ZeroProvider } from '@rocicorp/zero/react';
import { Zero } from '@rocicorp/zero';

import { schema } from '@/schema';
import { useAuth } from '@/contexts/auth-context';
import type { Schema } from '@/schema';

interface NeonAuthZeroProviderProps {
  children: React.ReactNode;
}

export function NeonAuthZeroProvider({ children }: NeonAuthZeroProviderProps) {
  const { accessToken, user, userId } = useAuth();
  const [zeroClient, setZeroClient] = useState<Zero<Schema> | null>(null);

  // Create Zero client based on access token and user
  const createZeroClient = useMemo(() => {
    if (!accessToken || !user || !userId) {
      return null;
    }

    return new Zero({
      userID: userId, // Use Neon Auth user ID
      auth: () => {
        return accessToken; // Use Neon Auth access token
      },
      server: import.meta.env.VITE_PUBLIC_SERVER,
      schema,
      kvStore: "idb",
    });
  }, [accessToken, user, userId]);

  useEffect(() => {
    setZeroClient(createZeroClient);
    
    // Cleanup previous client when access token changes
    return () => {
      if (zeroClient && zeroClient !== createZeroClient) {
        // Optionally cleanup the old client if needed
        // zeroClient.close?.(); // Check if Zero has a cleanup method
      }
    };
  }, [createZeroClient]);

  // If no user, render children anyway so Neon Auth can handle auth redirects
  if (!user) {
    return <>{children}</>;
  }

  // If we have a user but no access token or zero client yet, show loading
  if (!accessToken || !zeroClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <ZeroProvider zero={zeroClient}>
      {children}
    </ZeroProvider>
  );
} 