'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode, useMemo } from 'react';

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL || '';
  const convex = useMemo(() => new ConvexReactClient(convexUrl || 'https://placeholder.convex.cloud'), [convexUrl]);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
