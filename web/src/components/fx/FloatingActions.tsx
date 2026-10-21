"use client";

import { Loader2, MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { whatsappHref } from "@/lib/utils";

type Props = {
  whatsappNumber: string;
  whatsappGreeting: string;
  chatbot: { enabled: boolean; name: string; greeting: string };
};

/** Bottom-right action stack: WhatsApp (when configured) and the site chatbot (when enabled in the admin console). */
export function FloatingActions({ whatsappNumber, whatsappGreeting, chatbot }: Props) {
  if (!whatsappNumber && !chatbot.enabled) return null;
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {chatbot.enabled && <ChatWidget name={chatbot.name} greeting={chatbot.greeting} />}
      {whatsappNumber && (
        <a
          href={whatsappHref(whatsappNumber, whatsappGreeting)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with ASP Aero Tech on WhatsApp"
          data-cursor="WhatsApp"
          className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-[#04220f] shadow-[0_10px_40px_-8px_rgba(37,211,102,0.7)] transition-transform hover:scale-105"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-[#25D366]" aria-hidden />
          <svg viewBox="0 0 32 32" className="size-7" fill="currentColor" aria-hidden>
            <path d="M16.02 3.2A12.74 12.74 0 0 0 5.1 22.53L3.2 28.8l6.43-1.86A12.74 12.74 0 1 0 16.02 3.2Zm0 23.27a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-3.82 1.1 1.13-3.71-.25-.39a10.53 10.53 0 1 1 8.68 4.7Zm5.77-7.88c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
          </svg>
        </a>
      )}
    </div>
  );
}

type Msg = { role: "assistant" | "user"; text: string };

function ChatWidget({ name, greeting }: { name: string; greeting: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: greeting }]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [...m, { role: "assistant", text: data.reply || "I'm unable to respond right now. Please contact our team and we'll help you directly." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "I'm unable to respond right now. Please contact our team and we'll help you directly." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {open && (
        <div role="dialog" aria-label={`${name} chat`} className="glass-solid w-[min(88vw,22rem)] overflow-hidden rounded-2xl shadow-2xl" data-lenis-prevent>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="label-mono text-go">● Online · automated assistant</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-fg/5 hover:text-fg" aria-label="Close chat">
              <X size={16} />
            </button>
          </div>
          <div ref={listRef} className="h-72 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <p key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "ml-auto bg-cyan/15 text-fg" : "bg-fg/5 text-fg-muted"}`}>
                {m.text}
              </p>
            ))}
            {pending && (
              <p className="flex items-center gap-2 text-xs text-fg-dim">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </p>
            )}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              placeholder="Ask about our drone platforms…"
              className="field min-w-0 flex-1 py-2"
            />
            <button type="submit" disabled={!input.trim() || pending} className="btn btn-primary min-h-0 px-3 py-2 disabled:opacity-50" aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Open ${name} chat`}
        className="grid size-14 place-items-center rounded-full bg-signal text-ink shadow-[0_10px_40px_-8px_rgba(244,126,32,0.7)] transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </>
  );
}
