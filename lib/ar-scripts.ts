/* eslint-disable @typescript-eslint/no-explicit-any */

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

export function registerActiveArSession(scene: AframeScene): void {
  const tryRegister = () => {
    const session = scene.systems?.arjs?._arSession;
    if (session?.arSource) {
      activeArSession = session;
      fixArVideoPlacement();
      return;
    }
    requestAnimationFrame(tryRegister);
  };

  tryRegister();
}

export function fixArVideoPlacement(): void {
  if (typeof window === "undefined") return;

  const video = document.body.querySelector(":scope > video");
  if (!video) return;

  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");

  Object.assign((video as HTMLVideoElement).style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: "0",
    margin: "0",
    transform: "none",
  });

  void (video as HTMLVideoElement).play?.().catch(() => undefined);
}

export function watchArVideoPlacement(): () => void {
  if (typeof window === "undefined") return () => undefined;

  let videoObserver: MutationObserver | null = null;
  let rafId = 0;
  let attempts = 0;

  const attachVideoObserver = (video: HTMLVideoElement) => {
    videoObserver?.disconnect();
    videoObserver = new MutationObserver(() => fixArVideoPlacement());
    videoObserver.observe(video, { attributes: true, attributeFilter: ["style"] });
  };

  const tick = () => {
    fixArVideoPlacement();
    const video = document.body.querySelector(":scope > video") as HTMLVideoElement | null;
    if (video) attachVideoObserver(video);
    attempts += 1;
    if (attempts < 180) rafId = requestAnimationFrame(tick);
  };

  tick();

  const bodyObserver = new MutationObserver(() => {
    fixArVideoPlacement();
    const video = document.body.querySelector(":scope > video") as HTMLVideoElement | null;
    if (video) attachVideoObserver(video);
  });

  bodyObserver.observe(document.body, { childList: true });

  return () => {
    cancelAnimationFrame(rafId);
    videoObserver?.disconnect();
    bodyObserver.disconnect();
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

export function loadArScripts(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("AR scripts require browser"));
      return;
    }

    const w = window as Window & AframeGlobal;
    if (w.AFRAME) {
      registerHeartMeshComponent();
      resolve();
      return;
    }

    const loadScript = (src: string) =>
      new Promise<void>((res, rej) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => res();
        script.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });

    loadScript("https://aframe.io/releases/1.3.0/aframe.min.js")
      .then(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.7/aframe/build/aframe-ar.js",
        ),
      )
      .then(() => {
        registerHeartMeshComponent();
        resolve();
      })
      .catch(reject);
  });
}
