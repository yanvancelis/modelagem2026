"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--separator)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-display text-2xl tracking-wide text-[var(--accent)]"
        >
          Museu AR
        </button>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onPress={() => router.push("/")}>
            Exposição
          </Button>
          <Button variant="ghost" size="sm" onPress={() => router.push("/sobre")}>
            Sobre
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
