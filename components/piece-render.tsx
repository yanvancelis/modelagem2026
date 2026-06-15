"use client";

import { ModelViewer3D } from "@/components/model-viewer-3d";
import type { Piece } from "@/lib/pieces";

type PieceRenderProps = {
  piece: Piece;
  className?: string;
  fill?: boolean;
};

export function PieceRender({ piece, className, fill }: PieceRenderProps) {
  if (piece.model) {
    return (
      <ModelViewer3D
        src={piece.model.src}
        poster={piece.model.poster}
        alt={piece.title}
        className={className}
        fill={fill}
      />
    );
  }

  if (piece.cover) {
    return (
      <div
        className={`flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] ${className ?? ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={piece.cover}
          alt={piece.title}
          className="max-h-full max-w-full object-contain p-6"
        />
      </div>
    );
  }

  return null;
}

export function pieceHasRender(piece: Piece) {
  return Boolean(piece.model || piece.cover);
}
