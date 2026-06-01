import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AuthNavigationSync } from '../components/AuthNavigationSync';
import { useAuthListener } from '../hooks/useAuth';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { usePushNotifications } from '../hooks/usePushNotifications';

function AuthBootstrap({ children }: { children: ReactNode }) {
  useAuthListener();
  useOfflineSync();
  usePushNotifications();
  return (
    <>
      <AuthNavigationSync />
      {children}
    </>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 2, staleTime: 60_000 },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryClientProvider>
  );
}
