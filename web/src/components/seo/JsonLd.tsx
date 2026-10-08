import { serializeJsonLd } from "@/lib/seo";

/** Structured data (schema.org) — rendered server-side, escaped against </script> injection. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
