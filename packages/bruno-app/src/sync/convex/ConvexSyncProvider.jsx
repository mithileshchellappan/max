import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { setConvexClient } from './client';

const ConvexSyncContext = createContext({
  enabled: false,
  url: ''
});

const getConvexUrl = () => {
  return import.meta.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || '';
};

const ConvexSyncProvider = ({ children }) => {
  const convexUrl = getConvexUrl();
  const convexClient = useMemo(() => {
    if (!convexUrl) {
      return null;
    }

    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  useEffect(() => {
    setConvexClient(convexClient);
    return () => setConvexClient(null);
  }, [convexClient]);

  if (!convexClient) {
    return (
      <ConvexSyncContext.Provider value={{ enabled: false, url: '' }}>
        {children}
      </ConvexSyncContext.Provider>
    );
  }

  return (
    <ConvexSyncContext.Provider value={{ enabled: true, url: convexUrl }}>
      <ConvexAuthProvider client={convexClient}>{children}</ConvexAuthProvider>
    </ConvexSyncContext.Provider>
  );
};

export const useConvexSync = () => useContext(ConvexSyncContext);

export default ConvexSyncProvider;
