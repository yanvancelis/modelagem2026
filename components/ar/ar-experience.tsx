"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArGallery } from "@/components/ar/ar-gallery";
import {
  clearGalleryPhotos,
  deletePhotoFromGallery,
  formatStoryDate,
  loadGalleryPhotos,
  savePhotoToGallery,
  type GalleryPhoto,
} from "@/lib/gallery-db";
import {
  getArViewportRect,
  mountArScene,
  registerActiveArSession,
  scheduleArCleanup,
  loadArScripts,
  verifyPatternMarker,
  watchArVideoPlacement,
} from "@/lib/ar-scripts";

import type { Piece } from "@/lib/pieces";

type ArExperienceProps = {
  slug: string;
  title: string;
  modelSrc: string;
  ar?: Piece["ar"];
};

export function ArExperience({ slug, title, modelSrc, ar }: ArExperienceProps) {
  const router = useRouter();
  const sceneHostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [viewerPhotoId, setViewerPhotoId] = useState<number | null>(null);
  const [markerStatus, setMarkerStatus] = useState<"searching" | "found">("searching");

  const refreshPhotos = useCallback(async () => {
    try {
      const loaded = await loadGalleryPhotos();
      setPhotos(loaded);
    } catch {
      setPhotos([]);
    }
  }, []);

  useEffect(() => {
    refreshPhotos();
  }, [refreshPhotos]);

  useEffect(() => {
    let cancelled = false;
    let stopWatchingVideo: (() => void) | undefined;
    const host = sceneHostRef.current;
    setError(null);
    setReady(false);
    setMarkerStatus("searching");
    document.body.classList.add("ar-active");

    loadArScripts()
      .then(async () => {
        if (cancelled || !sceneHostRef.current) return;

        const markerPattern = ar?.markerPattern ?? "/markers/lampiao.patt";
        const patternOk = await verifyPatternMarker(markerPattern);
        if (!patternOk) {
          if (!cancelled) setError("Não foi possível carregar o arquivo do marcador (.patt).");
          return;
        }

        mountArScene(
          sceneHostRef.current,
          {
            modelSrc,
            markerPattern,
            markerSize: ar?.markerSize,
            scale: ar?.scale,
            position: ar?.position,
            rotation: ar?.rotation,
            backgroundModel: ar?.backgroundModel,
          },
          {
            onMarkerFound: () => setMarkerStatus("found"),
            onMarkerLost: () => setMarkerStatus("searching"),
            onSceneLoaded: (sceneEl) =>
              registerActiveArSession(sceneEl as Parameters<typeof registerActiveArSession>[0]),
          },
        );

        try {
          stopWatchingVideo = watchArVideoPlacement();
          setReady(true);
        } catch (cause) {
          console.error("AR placement failed:", cause);
          if (!cancelled) setError("Não foi possível iniciar a câmera AR.");
        }
      })
      .catch((cause) => {
        console.error("AR init failed:", cause);
        if (!cancelled) {
          const detail =
            cause instanceof Error && cause.message ? ` (${cause.message})` : "";
          setError(`Não foi possível carregar a experiência AR.${detail}`);
        }
      });

    return () => {
      cancelled = true;
      stopWatchingVideo?.();
      document.body.classList.remove("ar-active");
      scheduleArCleanup();
      if (host) host.replaceChildren();
    };
  }, [ar, modelSrc]);

  const composePhoto = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const scene = document.getElementById("ar-scene") as
        | (HTMLElement & { canvas?: HTMLCanvasElement })
        | null;
      const video = document.querySelector("video");
      const arCanvas = scene?.canvas;

      if (!arCanvas || !video || video.readyState < 2) {
        resolve(null);
        return;
      }

      requestAnimationFrame(() => {
        const output = document.createElement("canvas");
        const viewport = getArViewportRect();
        const viewWidth = viewport?.width ?? window.innerWidth;
        const viewHeight = viewport?.height ?? window.innerHeight;
        const ctx = output.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const videoRatio = videoWidth / videoHeight;
        const viewRatio = viewWidth / viewHeight;
        let sourceX: number;
        let sourceY: number;
        let sourceWidth: number;
        let sourceHeight: number;

        output.width = viewWidth;
        output.height = viewHeight;

        if (videoRatio > viewRatio) {
          sourceHeight = videoHeight;
          sourceWidth = videoHeight * viewRatio;
          sourceX = (videoWidth - sourceWidth) / 2;
          sourceY = 0;
        } else {
          sourceWidth = videoWidth;
          sourceHeight = videoWidth / viewRatio;
          sourceX = 0;
          sourceY = (videoHeight - sourceHeight) / 2;
        }

        ctx.drawImage(
          video,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          viewWidth,
          viewHeight,
        );
        ctx.drawImage(arCanvas, 0, 0, viewWidth, viewHeight);
        resolve(output.toDataURL("image/png"));
      });
    });
  }, []);

  const capturePhoto = async () => {
    const dataUrl = await composePhoto();
    if (!dataUrl) {
      alert("Aguarde a câmera carregar antes de capturar.");
      return;
    }

    try {
      await savePhotoToGallery(dataUrl);
      await refreshPhotos();
    } catch {
      alert("Não foi possível salvar a foto na galeria deste dispositivo.");
    }

    const link = document.createElement("a");
    link.download = `modelagem2026-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleClearGallery = async () => {
    if (!photos.length || !confirm("Apagar todas as fotos da galeria?")) return;
    await clearGalleryPhotos();
    await refreshPhotos();
    setViewerPhotoId(null);
  };

  const handleDeletePhoto = async (photoId: number) => {
    await deletePhotoFromGallery(photoId);
    await refreshPhotos();
    setViewerPhotoId(null);
  };

  const viewerPhoto = photos.find((p) => p.id === viewerPhotoId) ?? null;

  return (
    <div
      data-ar-viewport
      className="fixed inset-x-0 top-[var(--site-header-height)] bottom-12 z-[15] overflow-hidden md:bottom-0"
    >
      <div ref={sceneHostRef} className="absolute inset-0 z-[1]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[30] flex flex-col gap-3 p-4 pt-3">
        <div className="pointer-events-auto flex w-full items-center justify-between gap-4 rounded-[var(--radius)] border border-white/20 bg-black/45 px-4 py-3 backdrop-blur-md">
          <div className="min-w-0">
            <p className="font-display text-lg tracking-wide text-white">{title}</p>
            <p className="mt-1 text-xs text-white/75">
              {markerStatus === "found"
                ? "Marcador detectado — ajuste a distância se o modelo não aparecer"
                : "Aponte para o marcador impresso para visualizar a experiência"}
            </p>
            <a
              href="/markers/lampiao-marcador.pdf"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-white/90 underline"
            >
              Baixar marcador para impressão
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ar?.markerImage ?? "/markers/lampiao-marker.png"}
            alt="Marcador da exposição"
            className="h-14 w-14 shrink-0 rounded-sm border border-white/20 bg-white object-contain p-1"
          />
        </div>
      </div>

      {!ready && !error && (
        <div className="absolute inset-0 z-[25] flex items-center justify-center bg-[var(--background)]/90">
          <p className="text-sm text-[var(--muted-foreground)]">Iniciando câmera e cena AR…</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[var(--background)] p-6 text-center">
          <p className="text-[var(--danger)]">{error}</p>
          <Button
            variant="outline"
            onPress={() => {
              scheduleArCleanup();
              router.push(`/conteudo/${slug}`);
            }}
          >
            Voltar
          </Button>
        </div>
      )}

      {ready && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] flex items-center justify-between px-7 pb-4 md:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto w-[72px]" />
          <button
            type="button"
            aria-label="Capturar foto"
            onClick={capturePhoto}
            className="pointer-events-auto flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-transparent transition active:scale-95"
          >
            <span className="h-[62px] w-[62px] rounded-full bg-white transition active:scale-90" />
          </button>
          <button
            type="button"
            aria-label="Abrir galeria"
            onClick={() => setGalleryOpen(true)}
            className="pointer-events-auto flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[8px] border-2 border-white bg-white/10 transition active:scale-95"
          >
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0].dataUrl} alt="Última foto" className="h-full w-full object-cover" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            )}
          </button>
        </div>
      )}

      <ArGallery
        open={galleryOpen}
        photos={photos}
        onClose={() => setGalleryOpen(false)}
        onOpenPhoto={setViewerPhotoId}
        onClear={handleClearGallery}
        formatDate={formatStoryDate}
      />

      {viewerPhoto && (
        <div className="fixed inset-0 z-[10001] flex flex-col bg-black/95">
          <div className="flex items-center justify-between px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Button variant="ghost" size="sm" className="text-white" onPress={() => setViewerPhotoId(null)}>
              Fechar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onPress={() => {
                  const link = document.createElement("a");
                  link.download = `modelagem2026-${viewerPhoto.id}.png`;
                  link.href = viewerPhoto.dataUrl;
                  link.click();
                }}
              >
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--danger)]"
                onPress={() => handleDeletePhoto(viewerPhoto.id)}
              >
                Apagar
              </Button>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewerPhoto.dataUrl} alt="Foto AR" className="flex-1 object-contain" />
        </div>
      )}
    </div>
  );
}
