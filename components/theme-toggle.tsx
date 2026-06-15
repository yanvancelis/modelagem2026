"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="inline-flex h-9 items-center rounded-[6px] border border-[var(--border)] p-0.5"
        aria-hidden
      >
        <span className="flex size-8 items-center justify-center opacity-40">
          <SunIcon />
        </span>
        <span className="flex size-8 items-center justify-center opacity-40">
          <MoonIcon />
        </span>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className="inline-flex items-center rounded-[6px] border border-[var(--border)] bg-[var(--muted)] p-0.5"
      role="group"
      aria-label="Selecionar tema"
    >
      <button
        type="button"
        aria-label="Tema claro"
        aria-pressed={!isDark}
        onClick={() => setTheme("light")}
        className={`flex size-8 items-center justify-center rounded-[4px] transition ${
          !isDark
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        aria-label="Tema escuro"
        aria-pressed={isDark}
        onClick={() => setTheme("dark")}
        className={`flex size-8 items-center justify-center rounded-[4px] transition ${
          isDark
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        <MoonIcon />
      </button>
    </div>
  );
}
