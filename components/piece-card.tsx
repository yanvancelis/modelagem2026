"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "@heroui/react";
import type { Piece } from "@/lib/pieces";

export function PieceCard({ piece }: { piece: Piece }) {
  const router = useRouter();

  return (
    <Card className="border border-[var(--border)] bg-[var(--surface)]">
      <Card.Header className="flex flex-col items-start gap-1 p-5 pb-2">
        <Card.Title className="font-display text-2xl tracking-wide">{piece.title}</Card.Title>
        <Card.Description>{piece.subtitle}</Card.Description>
      </Card.Header>
      <Card.Content className="px-5 pb-2">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{piece.excerpt}</p>
      </Card.Content>
      <Card.Footer className="flex flex-wrap gap-2 p-5 pt-3">
        <Button variant="primary" onPress={() => router.push(`/conteudo/${piece.slug}`)}>
          Explorar
        </Button>
        <Button
          variant="outline"
          className="font-display tracking-wider"
          onPress={() => router.push(`/conteudo/${piece.slug}/ar`)}
        >
          Ver em AR
        </Button>
      </Card.Footer>
    </Card>
  );
}
