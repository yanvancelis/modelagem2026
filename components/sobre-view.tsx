"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { pieces } from "@/lib/pieces";

const mainPieceSlug = pieces[0]?.slug ?? "lampiao";

export function SobreView() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-4xl text-[var(--foreground)] md:text-5xl">Sobre</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--muted-foreground)]">
        <p>
          Projeto de modelagem tridimensional e realidade aumentada desenvolvido
          para a exposição de 2026. A identidade visual é inspirada na fachada
          rosa do museu — pilastras brancas, molduras ornamentais e iluminação
          magenta.
        </p>
        <p>
          O site combina conteúdo editorial, visualização 3D com{" "}
          <code className="rounded-[8px] bg-[var(--muted)] px-1.5 py-0.5 text-sm">model-viewer</code>{" "}
          e experiências AR com AR.js sobre marcadores personalizados.
        </p>
        <p>
          Marcadores customizados podem ser gerados no{" "}
          <a
            href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html"
            className="text-[var(--link)] underline"
            target="_blank"
            rel="noreferrer"
          >
            treinador oficial do AR.js
          </a>
          .
        </p>
      </div>
      <Button variant="outline" className="mt-8" onPress={() => router.push(`/conteudo/${mainPieceSlug}`)}>
        Ver exposição
      </Button>
    </div>
  );
}
