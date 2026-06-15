"use client";

import { Button } from "@heroui/react";
import type { GalleryPhoto } from "@/lib/gallery-db";

type ArGalleryProps = {
  open: boolean;
  photos: GalleryPhoto[];
  onClose: () => void;
  onOpenPhoto: (id: number) => void;
  onClear: () => void;
  formatDate: (timestamp: number) => string;
};

export function ArGallery({
  open,
  photos,
  onClose,
  onOpenPhoto,
  onClear,
  formatDate,
}: ArGalleryProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex items-center justify-between border-b border-[var(--separator)] px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h2 className="font-display text-xl">Seu story AR</h2>
        <Button variant="ghost" size="sm" onPress={onClose} aria-label="Fechar galeria">
          ×
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-4 sm:grid-cols-3">
        {photos.length === 0 ? (
          <p className="col-span-full text-sm text-[var(--muted-foreground)]">
            Nenhuma foto ainda. Use o obturador para capturar seu story AR.
          </p>
        ) : (
          photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-left"
              onClick={() => onOpenPhoto(photo.id)}
            >
              <div className="flex aspect-[3/4] items-center justify-center bg-[var(--muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt="Foto AR" className="h-full w-full object-contain" />
              </div>
              <time className="block px-2.5 py-2 text-xs text-[var(--muted-foreground)]">
                {formatDate(photo.createdAt)}
              </time>
            </button>
          ))
        )}
      </div>

      <div className="border-t border-[var(--separator)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" className="w-full" onPress={onClear}>
          Limpar galeria
        </Button>
      </div>
    </div>
  );
}
