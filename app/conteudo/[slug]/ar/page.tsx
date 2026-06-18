import { notFound } from "next/navigation";
import { ArExperience } from "@/components/ar/ar-experience";
import { getPiece } from "@/lib/pieces";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArPage({ params }: PageProps) {
  const { slug } = await params;
  const piece = getPiece(slug);

  if (!piece) {
    notFound();
  }

  return (
    <ArExperience
      slug={piece.slug}
      title={piece.title}
      modelSrc={piece.model?.src ?? ""}
      ar={piece.ar}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const piece = getPiece(slug);
  return {
    title: piece ? `AR — ${piece.title}` : "AR — Museu",
  };
}
