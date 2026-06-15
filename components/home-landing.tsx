"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { MuseumLogo, museumLogo } from "@/components/museum-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function HomeLanding() {
  const router = useRouter();

  return (
    <div className="landing-gradient relative flex min-h-screen flex-col items-center justify-start px-5 pb-16 pt-[14vh] text-center sm:px-6 md:justify-center md:px-10 md:py-16">
      <div className="absolute inset-x-0 top-0 flex justify-end p-4 md:p-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <MuseumLogo
          src={museumLogo.src}
          alt={museumLogo.alt}
          className="h-[4.5rem] w-[min(68vw,260px)] sm:h-24 sm:w-[min(72vw,300px)] md:h-32 md:w-[min(80vw,320px)]"
        />

        <div className="mt-24 flex w-full flex-col items-center md:mt-16">
          <p className="font-display w-full text-[clamp(1.75rem,9.5vw,2.875rem)] leading-[1.05] tracking-[0.02em] text-[var(--foreground)] md:text-3xl md:leading-snug">
            Uma experiência em Realidade Aumentada:
            <span className="mt-1 block text-[var(--accent)]">Sombras que assombram.</span>
          </p>

          <p className="mt-6 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Trabalho desenvolvido para a disciplina de Modelagem Tridimensional no curso de
            Design Digital na UFC Campus Quixadá.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="mt-10 min-w-[200px]"
            onPress={() => router.push("/conteudo/suzane")}
          >
            Entrar agora
          </Button>
        </div>
      </div>
    </div>
  );
}
