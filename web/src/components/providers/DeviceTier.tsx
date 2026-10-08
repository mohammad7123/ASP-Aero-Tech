"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { detectTier, probeWebGL, type Tier } from "@/lib/device";
import { isHeavyReady, subscribeHeavyReady, useHeavyReady } from "@/lib/hooks";

export type TierState = Tier | "pending";

const TierContext = createContext<TierState>("pending");
const noopSubscribe = () => () => {};

/**
 * Resolves the graphics tier on the client ("pending" during SSR).
 *
 * Cheap checks run at hydration. For capable devices the tier stays "pending"
 * until the deferred window opens (page loaded + idle, or first interaction —
 * see useHeavyReady); only then is WebGL probed and the 3D scenes allowed to
 * mount. Everything that waits on the tier shows its SVG fallback meanwhile.
 * The value is mirrored to <html data-tier> for CSS.
 */
export function DeviceTierProvider({ children }: { children: ReactNode }) {
  const quick = useSyncExternalStore<TierState>(noopSubscribe, () => detectTier().tier, () => "pending");
  const heavy = useHeavyReady();
  const webgl = useSyncExternalStore(subscribeHeavyReady, () => (isHeavyReady() ? probeWebGL() : null), () => null);

  const tier: TierState = quick === "pending" || quick === "static" ? quick : !heavy || webgl === null ? "pending" : webgl ? quick : "static";

  useEffect(() => {
    // CSS can use the provisional value while the WebGL decision is pending.
    const css = tier === "pending" ? quick : tier;
    if (css !== "pending") document.documentElement.dataset.tier = css;
  }, [tier, quick]);

  return <TierContext.Provider value={tier}>{children}</TierContext.Provider>;
}

export const useTier = () => useContext(TierContext);
