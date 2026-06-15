"use client";

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" isDisabled aria-label="Alternar tema">
        ···
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Alternar tema claro/escuro"
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "Claro" : "Escuro"}
    </Button>
  );
}
