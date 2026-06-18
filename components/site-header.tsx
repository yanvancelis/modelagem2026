"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Drawer, useOverlayState } from "@heroui/react";
import { MuseumLogo, museumLogo } from "@/components/museum-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { pieces } from "@/lib/pieces";

const mainPieceSlug = pieces[0]?.slug ?? "lampiao";

const navItems = [
  { label: "Exposição", href: `/conteudo/${mainPieceSlug}` },
  { label: "Sobre", href: "/sobre" },
] as const;

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function isNavActive(href: string, pathname: string) {
  if (href.startsWith("/conteudo/")) {
    return pathname.startsWith(href);
  }
  return pathname === href;
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const menuState = useOverlayState();

  const navigate = (href: string) => {
    menuState.close();
    router.push(href);
  };

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--separator)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-6 md:py-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex min-w-0 items-center"
          aria-label="Ir para o início"
        >
          <MuseumLogo
            src={museumLogo.src}
            alt={museumLogo.alt}
            className="h-9 w-[142px] sm:h-10 sm:w-[158px] md:h-14 md:w-[222px]"
          />
        </button>

        <nav className="hidden shrink-0 items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={isNavActive(item.href, pathname) ? "secondary" : "ghost"}
              size="sm"
              onPress={() => router.push(item.href)}
            >
              {item.label}
            </Button>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <ThemeToggle />
          <Drawer state={menuState}>
            <Drawer.Trigger aria-label="Abrir menu">
              <Button variant="ghost" size="sm" aria-label="Abrir menu">
                <MenuIcon />
              </Button>
            </Drawer.Trigger>
            <Drawer.Backdrop>
              <Drawer.Content placement="right">
                <Drawer.Dialog>
                  <Drawer.Header className="flex items-center justify-between gap-3 border-b border-[var(--separator)]">
                    <Drawer.Heading className="font-display text-xl tracking-wide">Menu</Drawer.Heading>
                    <Drawer.CloseTrigger aria-label="Fechar menu" />
                  </Drawer.Header>
                  <Drawer.Body className="flex flex-col gap-2 py-4">
                    {navItems.map((item) => (
                      <Button
                        key={item.href}
                        variant={isNavActive(item.href, pathname) ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onPress={() => navigate(item.href)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Drawer.Body>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
