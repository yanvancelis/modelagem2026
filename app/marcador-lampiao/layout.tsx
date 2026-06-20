"use client";

import { useEffect } from "react";

export default function MarcadorLampiaoLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("marcador-lampiao-page");
    return () => document.body.classList.remove("marcador-lampiao-page");
  }, []);

  return children;
}
