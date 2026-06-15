"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ModelViewer3D } from "@/components/model-viewer-3d";
import type { Piece } from "@/lib/pieces";

export function ContentView({ piece }: { piece: Piece }) {
  const router = useRouter();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
        Acervo digital
      </p>
      <h1 className="font-display text-4xl text-[var(--foreground)] md:text-5xl">
        {piece.title}
      </h1>
      <p className="mt-2 text-lg text-[var(--muted-foreground)]">{piece.subtitle}</p>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--foreground)]">
        {piece.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      {piece.model && (
        <section className="mt-10">
          <h2 className="font-display mb-4 text-2xl">Viewer 3D</h2>
          <ModelViewer3D
            src={piece.model.src}
            poster={piece.model.poster}
            alt={piece.title}
          />
        </section>
      )}

      {piece.gallery.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display mb-4 text-2xl">Galeria</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {piece.gallery.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="aspect-[3/4] w-full object-contain" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Button
          variant="primary"
          className="font-display tracking-wider"
          onPress={() => router.push(`/conteudo/${piece.slug}/ar`)}
        >
          Realidade aumentada
        </Button>
        <Button variant="outline" onPress={() => router.push("/")}>
          Voltar à exposição
        </Button>
      </div>
    </article>
  );
}
