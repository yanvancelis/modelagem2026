"use client";

import { createElement, useEffect } from "react";

type ModelViewer3DProps = {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  fill?: boolean;
};

export function ModelViewer3D({
  src,
  poster,
  alt,
  className,
  fill,
}: ModelViewer3DProps) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] ${fill ? "model-viewer-shell--fill h-full min-h-0" : ""} ${className ?? ""}`}
    >
      {createElement("model-viewer", {
        src,
        poster,
        alt,
        class: fill ? "model-viewer--fill" : undefined,
        "camera-controls": true,
        "touch-action": "pan-y",
        "auto-rotate": true,
        "shadow-intensity": "1",
        ar: true,
        "ar-modes": "webxr scene-viewer quick-look",
      })}
    </div>
  );
}
