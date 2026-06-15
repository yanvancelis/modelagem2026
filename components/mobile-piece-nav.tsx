"use client";

import { usePathname, useRouter } from "next/navigation";
import { scheduleArCleanup } from "@/lib/ar-scripts";

function getPieceRoute(pathname: string) {
  const match = pathname.match(/^\/conteudo\/([^/]+)(?:\/ar)?$/);
  if (!match) return null;

  return {
    slug: match[1],
    isAr: pathname.endsWith("/ar"),
  };
}

export function MobilePieceNav() {
  const pathname = usePathname();
  const router = useRouter();
  const route = getPieceRoute(pathname);

  if (!route) return null;

  const contentHref = `/conteudo/${route.slug}`;
  const arHref = `/conteudo/${route.slug}/ar`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-[var(--separator)] bg-[var(--surface)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Alternar entre conteúdo e realidade aumentada"
    >
      <button
        type="button"
        onClick={() => {
          if (route.isAr) scheduleArCleanup();
          router.push(contentHref);
        }}
        aria-current={!route.isAr ? "page" : undefined}
        className={`font-display flex h-12 flex-1 items-center justify-center tracking-wide transition ${
          !route.isAr
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-[var(--surface)] text-[var(--foreground)]"
        }`}
      >
        Conteúdo
      </button>
      <button
        type="button"
        onClick={() => router.push(arHref)}
        aria-current={route.isAr ? "page" : undefined}
        className={`font-display flex h-12 flex-1 items-center justify-center border-l border-[var(--separator)] tracking-wide transition ${
          route.isAr
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-[var(--surface)] text-[var(--foreground)]"
        }`}
      >
        Experiência RA
      </button>
    </nav>
  );
}

export function useShowsMobilePieceNav() {
  const pathname = usePathname();
  return getPieceRoute(pathname) !== null;
}
