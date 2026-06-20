/* eslint-disable @typescript-eslint/no-explicit-any */

export function resolvePublicUrl(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, window.location.origin).href;
}

export type ArIntroAnimation = {
  delayMs?: number;
  offsetY?: number;
  durationMs?: number;
};

export type ArModelPlacement = {
  src: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  introAnimation?: ArIntroAnimation;
};

export type ArSceneConfig = {
  modelSrc?: string;
  markerPattern: string;
  markerSize?: number;
  showPrimaryModel?: boolean;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  backgroundModels?: ArModelPlacement[];
};

function attachIntroRiseAnimation(
  marker: HTMLElement,
  entity: HTMLElement,
  finalPosition: [number, number, number],
  intro: ArIntroAnimation,
): void {
  const delayMs = intro.delayMs ?? 1000;
  const offsetY = intro.offsetY ?? -0.55;
  const durationMs = intro.durationMs ?? 1100;
  const [px, py, pz] = finalPosition;
  const startY = py + offsetY;
  const from = `${px} ${startY} ${pz}`;
  const to = `${px} ${py} ${pz}`;

  const resetPosition = () => {
    entity.setAttribute("position", from);
    entity.removeAttribute("animation__rise");
  };

  const playRise = () => {
    entity.setAttribute("position", from);
    entity.setAttribute(
      "animation__rise",
      `property: position; from: ${from}; to: ${to}; dur: ${durationMs}; easing: easeOutCubic`,
    );
  };

  resetPosition();

  let riseTimer: number | null = null;

  marker.addEventListener("markerFound", () => {
    if (riseTimer !== null) return;
    riseTimer = window.setTimeout(() => {
      riseTimer = null;
      playRise();
    }, delayMs);
  });

  marker.addEventListener("markerLost", () => {
    if (riseTimer !== null) {
      window.clearTimeout(riseTimer);
      riseTimer = null;
    }
    resetPosition();
  });
}

function appendBackgroundModels(marker: HTMLElement, models?: ArModelPlacement[]): void {
  models?.forEach((model, index) => {
    const position = model.position ?? [0, 0, 0];
    const entity = appendModelEntity(
      marker,
      `ar-background-entity-${index}`,
      model.src,
      model.scale,
      position,
      model.rotation,
    );

    if (model.introAnimation) {
      attachIntroRiseAnimation(marker, entity, position, model.introAnimation);
    }
  });
}

function appendModelEntity(
  parent: HTMLElement,
  id: string,
  src: string,
  scale?: [number, number, number],
  position?: [number, number, number],
  rotation?: [number, number, number],
): HTMLElement {
  const [sx, sy, sz] = scale ?? [1, 1, 1];
  const [px, py, pz] = position ?? [0, 0, 0];
  const [rx, ry, rz] = rotation ?? [0, 0, 0];

  const entity = document.createElement("a-entity");
  entity.id = id;
  entity.setAttribute("gltf-model", resolvePublicUrl(src));
  entity.setAttribute("position", `${px} ${py} ${pz}`);
  entity.setAttribute("rotation", `${rx} ${ry} ${rz}`);
  entity.setAttribute("scale", `${sx} ${sy} ${sz}`);
  parent.appendChild(entity);
  return entity;
}

export async function verifyPatternMarker(patternPath: string): Promise<boolean> {
  try {
    const response = await fetch(resolvePublicUrl(patternPath));
    if (!response.ok) return false;
    const text = await response.text();
    return text.trim().length > 0 && text.includes("255");
  } catch {
    return false;
  }
}

export function mountArScene(
  host: HTMLElement,
  config: ArSceneConfig,
  callbacks?: {
    onMarkerFound?: () => void;
    onMarkerLost?: () => void;
    onSceneLoaded?: (scene: HTMLElement) => void;
  },
): HTMLElement {
  host.replaceChildren();

  const scene = document.createElement("a-scene");
  scene.id = "ar-scene";
  scene.setAttribute("embedded", "");
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute(
    "renderer",
    "alpha: true; antialias: true; precision: medium; preserveDrawingBuffer: true; logarithmicDepthBuffer: true;",
  );
  scene.setAttribute("arjs", "sourceType: webcam; debugUIEnabled: false; detectionMode: mono;");
  scene.style.cssText = "position:absolute;inset:0;z-index:1;";

  const marker = document.createElement("a-marker");
  marker.id = "ar-marker";
  marker.setAttribute("type", "pattern");
  marker.setAttribute("url", resolvePublicUrl(config.markerPattern));
  marker.setAttribute("size", String(config.markerSize ?? 1));
  marker.setAttribute("min-confidence", "0.45");
  marker.setAttribute("smooth", "true");

  appendBackgroundModels(marker, config.backgroundModels);

  if (config.modelSrc && config.showPrimaryModel !== false) {
    appendModelEntity(
      marker,
      "ar-model-entity",
      config.modelSrc,
      config.scale,
      config.position,
      config.rotation,
    );
  }

  const camera = document.createElement("a-entity");
  camera.setAttribute("camera", "");

  scene.appendChild(marker);
  scene.appendChild(camera);
  host.appendChild(scene);

  if (callbacks?.onMarkerFound) marker.addEventListener("markerFound", callbacks.onMarkerFound);
  if (callbacks?.onMarkerLost) marker.addEventListener("markerLost", callbacks.onMarkerLost);
  if (callbacks?.onSceneLoaded) {
    scene.addEventListener("loaded", () => callbacks.onSceneLoaded!(scene), { once: true });
  }

  return scene;
}

type AframeGlobal = {
  AFRAME?: {
    THREE: any;
    components: Record<string, unknown>;
    registerComponent: (name: string, definition: object) => void;
  };
};

export function registerHeartMeshComponent() {
  if (typeof window === "undefined") return;
  const w = window as Window & AframeGlobal;
  if (!w.AFRAME || w.AFRAME.components["heart-mesh"]) return;

  w.AFRAME.registerComponent("heart-mesh", {
    init: function (this: { el: { setObject3D: (name: string, obj: unknown) => void } }) {
      const THREE = w.AFRAME!.THREE;
      const { vertices, trianglesIndexes } = getHeartCoordinates(THREE);
      const heartMesh = createHeartMesh(THREE, vertices, trianglesIndexes);

      heartMesh.geometry.center();
      heartMesh.geometry.computeBoundingBox();

      const box = heartMesh.geometry.boundingBox;
      const meshWidth = box.max.x - box.min.x;
      const meshHeight = box.max.y - box.min.y;
      const markerSize = 1;
      const sizeMultiplier = 3;
      const fitScale = (markerSize / Math.max(meshWidth, meshHeight)) * sizeMultiplier;

      heartMesh.scale.set(fitScale, fitScale, fitScale);
      this.el.setObject3D("mesh", heartMesh);
    },
  });
}

function getHeartCoordinates(THREE: any) {
  const vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 5, -1.5),
    new THREE.Vector3(5, 5, 0),
    new THREE.Vector3(9, 9, 0),
    new THREE.Vector3(5, 9, 2),
    new THREE.Vector3(7, 13, 0),
    new THREE.Vector3(3, 13, 0),
    new THREE.Vector3(0, 11, 0),
    new THREE.Vector3(5, 9, -2),
    new THREE.Vector3(0, 8, -3),
    new THREE.Vector3(0, 8, 3),
    new THREE.Vector3(0, 5, 1.5),
    new THREE.Vector3(-9, 9, 0),
    new THREE.Vector3(-5, 5, 0),
    new THREE.Vector3(-5, 9, -2),
    new THREE.Vector3(-5, 9, 2),
    new THREE.Vector3(-7, 13, 0),
    new THREE.Vector3(-3, 13, 0),
  ];

  const trianglesIndexes = [
    2, 11, 0, 2, 3, 4, 5, 4, 3, 4, 5, 6, 4, 6, 7, 4, 7, 10, 4, 10, 11, 4, 11, 2, 0, 11, 13, 12,
    13, 15, 12, 15, 16, 16, 15, 17, 17, 15, 7, 7, 15, 10, 11, 10, 15, 13, 11, 15, 0, 1, 2, 1, 9,
    2, 9, 8, 2, 5, 3, 8, 8, 3, 2, 6, 5, 8, 7, 6, 8, 9, 7, 8, 14, 17, 7, 14, 7, 9, 14, 9, 1, 9, 1,
    13, 1, 0, 13, 14, 1, 13, 16, 14, 12, 16, 17, 14, 12, 14, 13,
  ];

  return { vertices, trianglesIndexes };
}

function createHeartMesh(THREE: any, coordinatesList: any[], trianglesIndexes: number[]) {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  for (let i = 0; i < trianglesIndexes.length; i++) {
    if ((i + 1) % 3 === 0) {
      const points = [
        coordinatesList[trianglesIndexes[i - 2]],
        coordinatesList[trianglesIndexes[i - 1]],
        coordinatesList[trianglesIndexes[i]],
      ];

      points.forEach((point) => {
        positions.push(point.x, point.y, point.z);
      });

      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
      vertexIndex += 3;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({
    color: 0xad0c00,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

type ArSession = {
  arSource?: { dispose?: () => void };
  arContext?: { dispose?: () => void };
};

type AframeScene = HTMLElement & {
  destroy?: () => void;
  pause?: () => void;
  systems?: {
    arjs?: {
      _arSession?: ArSession;
    };
  };
};

let activeArSession: ArSession | null = null;

const AR_VIEWPORT_SELECTOR = "[data-ar-viewport]";

export function getArViewportRect(): DOMRect | null {
  const viewport = document.querySelector(AR_VIEWPORT_SELECTOR);
  if (!viewport) return null;

  const rect = viewport.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return rect;
}

function getArMediaStyles(rect: DOMRect | null) {
  if (rect) {
    return {
      position: "fixed",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      minHeight: `${rect.height}px`,
      maxHeight: `${rect.height}px`,
      margin: "0",
      transform: "none",
    } as const;
  }

  const headerHeight =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--site-header-height")
      .trim() || "4.75rem";
  const bottomOffset =
    getComputedStyle(document.body).getPropertyValue("--ar-bottom-offset").trim() ||
    "0px";
  const viewportHeight = `calc(100dvh - ${headerHeight} - ${bottomOffset})`;

  return {
    position: "fixed",
    top: headerHeight,
    left: "0",
    right: "0",
    bottom: bottomOffset,
    width: "100%",
    height: viewportHeight,
    minHeight: viewportHeight,
    maxHeight: viewportHeight,
    margin: "0",
    transform: "none",
  } as const;
}

export function registerActiveArSession(scene: AframeScene): void {
  const tryRegister = () => {
    const session = scene.systems?.arjs?._arSession;
    if (session?.arSource) {
      activeArSession = session;
      fixArMediaPlacement();
      return;
    }
    requestAnimationFrame(tryRegister);
  };

  tryRegister();
}

export function fixArMediaPlacement(): void {
  if (typeof window === "undefined") return;

  const rect = getArViewportRect();
  const sharedStyles = getArMediaStyles(rect);

  const video = document.body.querySelector(":scope > video");
  if (video) {
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");

    Object.assign((video as HTMLVideoElement).style, {
      ...sharedStyles,
      objectFit: "cover",
      objectPosition: "center center",
      zIndex: "1",
    });

    void (video as HTMLVideoElement).play?.().catch(() => undefined);
  }

  document.body.querySelectorAll(":scope > canvas").forEach((canvas) => {
    Object.assign((canvas as HTMLCanvasElement).style, {
      ...sharedStyles,
      zIndex: "2",
    });
  });

  const scene = document.getElementById("ar-scene") as
    | (HTMLElement & { resize?: () => void; canvas?: HTMLCanvasElement })
    | null;
  if (scene) {
    Object.assign(scene.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });

    const sceneCanvas = scene.canvas ?? scene.querySelector("canvas.a-canvas");
    if (sceneCanvas) {
      Object.assign((sceneCanvas as HTMLCanvasElement).style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
    }

    try {
      scene.resize?.();
    } catch {
      // Scene may not be fully initialized yet (renderer/xr unavailable).
    }
  }

  Object.assign(document.body.style, {
    overflow: "hidden",
    width: "100%",
    height: "100%",
    margin: "0",
    padding: "0",
    transform: "none",
  });
}

/** @deprecated use fixArMediaPlacement */
export function fixArVideoPlacement(): void {
  fixArMediaPlacement();
}

export function watchArVideoPlacement(): () => void {
  if (typeof window === "undefined") return () => undefined;

  let videoObserver: MutationObserver | null = null;
  let viewportObserver: ResizeObserver | null = null;
  let rafId = 0;
  let attempts = 0;

  const attachVideoObserver = (video: HTMLVideoElement) => {
    videoObserver?.disconnect();
    videoObserver = new MutationObserver(() => fixArMediaPlacement());
    videoObserver.observe(video, { attributes: true, attributeFilter: ["style"] });
  };

  const tick = () => {
    fixArMediaPlacement();
    const video = document.body.querySelector(":scope > video") as HTMLVideoElement | null;
    if (video) attachVideoObserver(video);
    attempts += 1;
    if (attempts < 240) rafId = requestAnimationFrame(tick);
  };

  tick();

  const bodyObserver = new MutationObserver(() => {
    fixArMediaPlacement();
    const video = document.body.querySelector(":scope > video") as HTMLVideoElement | null;
    if (video) attachVideoObserver(video);
  });

  bodyObserver.observe(document.body, { childList: true });

  const viewport = document.querySelector(AR_VIEWPORT_SELECTOR);
  if (viewport) {
    viewportObserver = new ResizeObserver(() => fixArMediaPlacement());
    viewportObserver.observe(viewport);
  }

  const onViewportChange = () => fixArMediaPlacement();
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("orientationchange", onViewportChange);

  return () => {
    cancelAnimationFrame(rafId);
    videoObserver?.disconnect();
    bodyObserver.disconnect();
    viewportObserver?.disconnect();
    window.removeEventListener("resize", onViewportChange);
    window.removeEventListener("orientationchange", onViewportChange);
  };
}

function disposeActiveArSession(): void {
  if (!activeArSession) return;

  try {
    activeArSession.arSource?.dispose?.();
    activeArSession.arContext?.dispose?.();
  } catch {
    // ignore teardown errors from partially initialized sessions
  }

  activeArSession = null;
}

export function cleanupArResources(): void {
  if (typeof window === "undefined") return;

  disposeActiveArSession();

  const scene =
    (document.getElementById("ar-scene") ??
      document.querySelector("a-scene")) as AframeScene | null;

  if (scene) {
    const session = scene.systems?.arjs?._arSession;
    try {
      session?.arSource?.dispose?.();
      session?.arContext?.dispose?.();
      scene.pause?.();
      scene.destroy?.();
    } catch {
      // ignore teardown errors from partially initialized scenes
    }
    scene.remove();
  }

  document.querySelectorAll("video").forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    video.remove();
  });

  document.body.querySelectorAll(":scope > canvas").forEach((canvas) => {
    canvas.remove();
  });

  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
}

export function scheduleArCleanup(): void {
  cleanupArResources();
  requestAnimationFrame(cleanupArResources);
  window.setTimeout(cleanupArResources, 0);
}

let arScriptsPromise: Promise<void> | null = null;

function isArReady(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & AframeGlobal;
  return Boolean(w.AFRAME?.components?.["arjs-anchor"]);
}

function isAframeReady(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as Window & AframeGlobal).AFRAME);
}

function waitForLibrary(isLoaded: () => boolean, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const check = () => {
      if (isLoaded()) {
        resolve();
        return;
      }
      if (performance.now() - start > timeoutMs) {
        reject(new Error("Timeout waiting for AR library"));
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

function loadScript(src: string, isLoaded: () => boolean): Promise<void> {
  if (isLoaded()) return Promise.resolve();

  const ensureScript = (): Promise<void> =>
    new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        res();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => res();
      script.onerror = () => rej(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  return ensureScript().then(() => waitForLibrary(isLoaded));
}

export function loadArScripts(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("AR scripts require browser"));
  }

  if (isArReady()) {
    registerHeartMeshComponent();
    return Promise.resolve();
  }

  if (arScriptsPromise) return arScriptsPromise;

  arScriptsPromise = new Promise((resolve, reject) => {
    const w = window as Window & AframeGlobal;

    const aframeSrc = "https://aframe.io/releases/1.3.0/aframe.min.js";
    const arJsSrc =
      "https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.7/aframe/build/aframe-ar.js";

    const loadArJs = () =>
      loadScript(arJsSrc, isArReady).then(() => {
        registerHeartMeshComponent();
      });

    const boot = w.AFRAME ? loadArJs() : loadScript(aframeSrc, isAframeReady).then(loadArJs);

    boot
      .then(() => resolve())
      .catch((error) => {
        arScriptsPromise = null;
        reject(error);
      });
  });

  return arScriptsPromise;
}
