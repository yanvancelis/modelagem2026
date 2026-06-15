import { PieceCard } from "@/components/piece-card";
import { pieces } from "@/lib/pieces";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <section className="mb-10 max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
          Exposição 2026
        </p>
        <h1 className="font-display text-5xl leading-none text-[var(--foreground)] md:text-6xl">
          Modelagem Tridimensional
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted-foreground)]">
          Navegue pelas peças do acervo, explore modelos 3D no navegador e
          experimente a realidade aumentada apontando para o marcador Hiro.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {pieces.map((piece) => (
          <PieceCard key={piece.slug} piece={piece} />
        ))}
      </div>
    </div>
  );
}
