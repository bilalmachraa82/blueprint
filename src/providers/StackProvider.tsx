'use client';

import React from 'react';
import { StackProvider as StackAuthProvider } from '@stackframe/stack';
import { stackApp } from '@/lib/auth/stack-client';

export function StackProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackAuthProvider app={stackApp}>
      {children}
    </StackAuthProvider>
  );
}