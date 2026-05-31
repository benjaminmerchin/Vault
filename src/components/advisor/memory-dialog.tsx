"use client";

import { useState } from "react";
import { Brain, Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Memory = { id: string; content: string; contentType: string; createdAt: string };

export function MemoryButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [facts, setFacts] = useState<string[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [note, setNote] = useState<string | undefined>();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/memory");
      const d = await r.json();
      setFacts(Array.isArray(d.facts) ? d.facts : []);
      setMemories(Array.isArray(d.memories) ? d.memories : []);
      setNote(d.note);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
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
              The private context your advisor reasons over — derived from your
              encrypted vault. Only you can read it.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <ul className="space-y-2">
                {facts.map((f, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-xl border border-border bg-card/50 px-3.5 py-2.5 text-sm"
                  >
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
                {facts.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    Nothing yet — add accounts or load a portfolio and your
                    advisor will have context to remember.
                  </li>
                )}
              </ul>

              {memories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Saved memories (Krava)
                  </p>
                  <ul className="space-y-1.5">
                    {memories.map((m) => (
                      <li
                        key={m.id}
                        className="rounded-xl border border-border px-3.5 py-2.5 text-sm"
                      >
                        {m.content}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
