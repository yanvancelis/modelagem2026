"use client";

import { Button } from "@heroui/react";
import { useEffect } from "react";

type GallerySandboxProps = {
  images: string[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function GallerySandbox({
  images,
  index,
  onClose,
  onChange,
}: GallerySandboxProps) {
  const open = index !== null;
  const current = index ?? 0;
  const hasPrev = current > 0;
  const hasNext = current < images.length - 1;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onChange(current - 1);
      if (event.key === "ArrowRight" && hasNext) onChange(current + 1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, current, hasPrev, hasNext, onClose, onChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da galeria"
    >
      <div className="flex items-center justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="ghost" size="sm" className="text-white" onPress={onClose}>
          Fechar
        </Button>
        <span className="text-sm text-white/70">
          {current + 1} / {images.length}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            isDisabled={!hasPrev}
            onPress={() => onChange(current - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            isDisabled={!hasNext}
            onPress={() => onChange(current + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[current]}
        alt=""
        className="mx-auto w-full flex-1 object-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      />
    </div>
  );
}
