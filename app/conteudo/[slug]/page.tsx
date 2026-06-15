import { notFound } from "next/navigation";
import { ContentView } from "@/components/content-view";
import { getPiece } from "@/lib/pieces";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const piece = getPiece(slug);

  if (!piece) {
    notFound();
  }

  return <ContentView piece={piece} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const piece = getPiece(slug);
  return {
    title: piece ? `${piece.title} — Museu AR` : "Conteúdo — Museu AR",
  };
}
