'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import SearchDialog from '@/components/search';
import type { ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{
        SearchDialog,
      }}
      theme={{
        scriptProps:
          typeof window === 'undefined' ? undefined : { type: 'application/json' },
      }}
    >
      {children}
    </RootProvider>
  );
}
