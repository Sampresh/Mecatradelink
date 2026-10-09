'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { STATIC_MODE } from '@/lib/mode';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    // Showcase mode has no API, so there is no session to restore.
    if (STATIC_MODE) useAuthStore.setState({ status: 'ready' });
    else if (useAuthStore.getState().status === 'idle') bootstrap();
  }, [bootstrap]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
