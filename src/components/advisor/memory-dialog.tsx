"use client";

import { useState } from "react";
import { Brain, Loader2, Lock, Sparkles, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MemoryButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remembered, setRemembered] = useState<string[]>([]);
  const [facts, setFacts] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/memory");
      const d = await r.json();
      setRemembered(Array.isArray(d.remembered) ? d.remembered : []);
      setFacts(Array.isArray(d.facts) ? d.facts : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function forget() {
    setRemembered([]);
    await fetch("/api/memory", { method: "DELETE" }).catch(() => {});
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
        onClick={() => {
          setOpen(true);
          load();
        }}
      >
        <Brain className="size-3.5" />
        Memory
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="size-4 text-primary" />
              What Vault remembers about you
            </DialogTitle>
            <DialogDescription>
              Long-term memory learned across your chats, plus context from your
              accounts — all encrypted in your vault. Only you can read it.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-5 overflow-y-auto">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Brain className="size-3.5 text-primary" /> Remembered from your chats
                  </p>
                  {remembered.length > 0 && (
                    <button
                      onClick={forget}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Forget all
                    </button>
                  )}
                </div>
                {remembered.length > 0 ? (
                  <ul className="space-y-2">
                    {remembered.map((m, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-sm"
                      >
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-3.5 py-3 text-sm text-muted-foreground">
                    Nothing yet — as you chat with your advisor, it remembers
                    durable things (goals, plans, preferences) here and uses them
                    in future conversations.
                  </p>
                )}
              </section>

              <section>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Wallet className="size-3.5 text-primary" /> From your accounts
                </p>
                <ul className="space-y-2">
                  {facts.map((f, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 rounded-xl border border-border bg-card/50 px-3.5 py-2.5 text-sm"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <p className="flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <Lock className="size-3 shrink-0 text-primary" />
                Encrypted at rest · zero-retention inference · anonymized via Krava
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
