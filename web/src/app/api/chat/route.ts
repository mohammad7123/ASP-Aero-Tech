import { NextResponse } from "next/server";
import { apiConfigured, apiUrl } from "@/lib/api";

/**
 * Proxies the website chatbot to the existing API (POST /api/chatbot/messages)
 * so the browser never needs the API origin and provider keys stay server-side.
 */
export async function POST(request: Request) {
  if (!apiConfigured) return NextResponse.json({ reply: null }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { message?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!message) return NextResponse.json({ error: "A message is required." }, { status: 400 });

  try {
    const res = await fetch(apiUrl("/chatbot/messages"), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const data = (await res.json().catch(() => ({}))) as { reply?: string };
    return NextResponse.json({ reply: data.reply ?? null }, { status: res.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ reply: null }, { status: 504 });
  }
}
