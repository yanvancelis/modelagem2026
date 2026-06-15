"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { GallerySandbox } from "@/components/gallery-sandbox";
import { pieceHasRender, PieceRender } from "@/components/piece-render";
import { scheduleArCleanup } from "@/lib/ar-scripts";
import type { Piece } from "@/lib/pieces";

const MOBILE_RENDER_HEIGHT = "min(52vh, 440px)";

function PieceText({ piece }: { piece: Piece }) {
  return (
    <>
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
        Acervo digital
      </p>
      <h1 className="font-display text-4xl text-[var(--foreground)] md:text-5xl lg:text-6xl">
        {piece.title}
      </h1>
      <p className="mt-2 text-lg text-[var(--muted-foreground)] md:text-xl">
        {piece.subtitle}
      </p>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--foreground)] md:text-lg">
        {piece.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </>
  );
}

export function ContentView({ piece }: { piece: Piece }) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasRender = pieceHasRender(piece);

  useEffect(() => {
    scheduleArCleanup();
  }, []);

  return (
    <article className="relative">
      {hasRender && (
        <>
          <div
            className="fixed inset-x-0 z-0 md:hidden"
            style={{
              top: "var(--site-header-height)",
              height: MOBILE_RENDER_HEIGHT,
            }}
          >
            <PieceRender piece={piece} fill className="h-full rounded-none border-0" />
          </div>
          <div
            className="md:hidden"
            style={{ height: MOBILE_RENDER_HEIGHT }}
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10 md:grid md:min-h-[calc(100vh-var(--site-header-height))] md:grid-cols-2">
        <div
          className={`bg-[var(--background)] px-4 py-8 md:flex md:flex-col md:justify-center md:px-8 md:py-14 lg:px-12 xl:px-16 ${
            hasRender
              ? "rounded-t-[var(--radius)] shadow-[0_-16px_48px_rgba(26,18,22,0.08)] md:rounded-none md:shadow-none"
              : ""
          }`}
        >
          <PieceText piece={piece} />

          <div className="mt-10 hidden flex-wrap gap-3 md:flex">
            <Button variant="primary" onPress={() => router.push(`/conteudo/${piece.slug}/ar`)}>
              Realidade aumentada
            </Button>
            <Button variant="outline" onPress={() => router.push("/")}>
              Voltar ao início
            </Button>
          </div>
        </div>

        {hasRender && (
          <div className="hidden md:block">
            <div
              className="sticky px-8 py-10 lg:px-10 lg:py-12 xl:px-14"
              style={{
                top: "var(--site-header-height)",
                height: "calc(100vh - var(--site-header-height))",
              }}
            >
              <PieceRender piece={piece} fill className="h-full" />
            </div>
          </div>
        )}
      </div>

      {piece.gallery.length > 0 && (
        <section className="relative z-10 border-t border-[var(--separator)] bg-[var(--background)] px-4 py-10 md:px-8 md:py-14 lg:px-12 xl:px-16">
          <h2 className="font-display mb-6 text-2xl md:text-3xl">Galeria</h2>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {piece.gallery.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] transition hover:border-[var(--accent)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  className="aspect-[3/4] h-40 w-auto object-contain sm:h-48 md:h-56"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      <GallerySandbox
        images={piece.gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </article>
  );
}
