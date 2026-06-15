"use client";

import { MobilePieceNav, useShowsMobilePieceNav } from "@/components/mobile-piece-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const showsPieceNav = useShowsMobilePieceNav();

  return (
    <>
      <main className={showsPieceNav ? "pb-12 md:pb-0" : undefined}>{children}</main>
      <MobilePieceNav />
    </>
  );
}
