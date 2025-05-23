'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from '@/lib/redux/store';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme/theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </Provider>
  );
} 