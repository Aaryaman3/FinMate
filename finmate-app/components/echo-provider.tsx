'use client';

import { ReactNode } from 'react';
import { EchoProvider as EchoNextProvider } from '@merit-systems/echo-next-sdk/client';

interface EchoProviderProps {
  children: ReactNode;
}

export function EchoProvider({ children }: EchoProviderProps) {
  return (
    <EchoNextProvider
      config={{
        appId: process.env.NEXT_PUBLIC_ECHO_APP_ID || '',
      }}
    >
      {children}
    </EchoNextProvider>
  );
}
