"use client";

import { createElement, useEffect } from "react";

type ModelViewer3DProps = {
  src: string;
  poster?: string;
  alt: string;
};

export function ModelViewer3D({ src, poster, alt }: ModelViewer3DProps) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]">
      {createElement("model-viewer", {
        src,
        poster,
        alt,
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
