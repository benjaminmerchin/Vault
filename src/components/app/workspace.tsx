"use client";

import { Lock, Sparkles } from "lucide-react";
import { AdvisorPanel } from "@/components/advisor/advisor-panel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export function Workspace({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel id="main" defaultSize="70%" minSize="50%" className="min-w-0">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">{children}</div>
        </div>
      </ResizablePanel>

      <ResizableHandle
        withHandle
        className="bg-border/60 transition-colors hover:bg-primary/40"
      />

      <ResizablePanel
        id="advisor"
        defaultSize="30%"
        minSize="24%"
        maxSize="44%"
        className="min-w-0"
      >
        <aside className="flex h-full flex-col bg-card/30">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-medium">
            <Sparkles className="size-4 text-primary" />
            Vault Advisor
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Lock className="size-3" />
              Private
            </span>
          </div>
          <div className="min-h-0 flex-1 px-4">
            <AdvisorPanel />
          </div>
        </aside>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
