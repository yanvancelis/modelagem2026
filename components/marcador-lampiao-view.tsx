"use client";

import { ModelViewer3D } from "@/components/model-viewer-3d";
import { getPiece } from "@/lib/pieces";

export function MarcadorLampiaoView() {
  const piece = getPiece("lampiao");

  if (!piece?.model?.src) {
    return null;
  }

  const markerImage = piece.ar?.markerImage ?? "/markers/lampiao-marker.png";

  return (
    <div className="marcador-lampiao-page__shell flex min-h-dvh flex-col bg-white">
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="marcador-lampiao-page__viewer h-[min(58vh,520px)] w-full max-w-lg">
          <ModelViewer3D
            src={piece.model.src}
            poster={piece.model.poster}
            alt={piece.title}
            fill
            className="h-full border-0 bg-transparent shadow-none"
          />
        </div>
      </div>

      <footer className="marcador-lampiao-page__footer border-t border-neutral-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={markerImage}
            alt="Marcador AR da exposição Lampião"
            className="w-full max-w-[280px] rounded-sm border border-neutral-200 bg-white p-3 shadow-sm"
          />
        </div>
      </footer>
    </div>
  );
}
