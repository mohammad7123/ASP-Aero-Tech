"use client";

import type { ReactNode } from "react";
import { DeviceTierProvider } from "./DeviceTier";
import { PageTransitionProvider } from "./PageTransition";
import { SmoothScroll } from "./SmoothScroll";
import { SoundProvider } from "./Sound";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <DeviceTierProvider>
      <SmoothScroll>
        <PageTransitionProvider>
          <SoundProvider>{children}</SoundProvider>
        </PageTransitionProvider>
      </SmoothScroll>
    </DeviceTierProvider>
  );
}
