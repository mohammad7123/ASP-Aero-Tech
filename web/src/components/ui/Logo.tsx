import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo with a variant per theme. Both are in the markup and CSS
 * (.on-dark / .on-light) shows the right one, so there is no flash.
 */
export function Logo({ className, priority, sizes, width = 520, height = 239, alt }: { className?: string; priority?: boolean; sizes?: string; width?: number; height?: number; alt: string }) {
  return (
    <>
      <Image src="/brand/asp-logo-reversed-sm.png" alt={alt} width={width} height={height} priority={priority} sizes={sizes} className={cn("on-dark", className)} />
      <Image src="/brand/asp-logo-sm.png" alt={alt} width={width} height={height} priority={priority} sizes={sizes} className={cn("on-light", className)} />
    </>
  );
}
