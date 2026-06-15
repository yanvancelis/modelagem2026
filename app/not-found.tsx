import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-4xl">Peça não encontrada</h1>
      <p className="mt-3 text-[var(--muted-foreground)]">
        O conteúdo que você procura não existe nesta exposição.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-foreground)]"
      >
        Voltar à exposição
      </Link>
    </div>
  );
}
