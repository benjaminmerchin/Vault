"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, SendHorizontal, ServerOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/advisor/markdown";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "What should I pay off first?",
  "Where am I overspending?",
  "Can I afford a $6k trip to Japan?",
  "Am I saving enough each month?",
];

export function AdvisorPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatId = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, chatId: chatId.current }),
      });
      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let reply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.chatId) chatId.current = evt.chatId;
            if (evt.text) {
              reply += evt.text;
              setMessages((m) => [
                ...m.slice(0, -1),
                { role: "assistant", text: reply },
              ]);
            }
          } catch {
            /* ignore keep-alives */
          }
        }
      }
      if (!reply) {
        setMessages((m) => [
          ...m.slice(0, -1),
          { role: "assistant", text: "(No response — try again.)" },
        ]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m.slice(0, -1),
        {
          role: "assistant",
          text: `⚠️ ${(e as Error).message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="size-6" />
            </span>
            <h3 className="mt-4 font-semibold">Ask Vault about your money</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your advisor can see your accounts, holdings, debts and goals —
              and it forgets the moment the model responds.
            </p>
            <div className="mt-5 grid w-full gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  m.text ? (
                    <Markdown>{m.text}</Markdown>
                  ) : loading && i === messages.length - 1 ? (
                    <Dots />
                  ) : null
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* composer */}
      <div className="border-t border-border pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about your finances…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0" disabled={loading || !input.trim()}>
            <SendHorizontal className="size-4" />
          </Button>
        </form>
        <p className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Lock className="size-3" /> Encrypted
          </span>
          <span className="inline-flex items-center gap-1">
            <ServerOff className="size-3" /> Zero-retention
          </span>
          <span>via Krava</span>
        </p>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
