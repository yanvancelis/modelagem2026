(function () {
  const AR_VIEWPORT_SELECTOR = "[data-ar-viewport]";
  let activeArSession = null;
  let stopWatching = null;

  function resolvePublicUrl(path) {
    if (!path || /^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith("/") ? path : "/" + path;
    return new URL(normalized, window.location.origin).href;
  }

  let arScriptsPromise = null;

  function isArReady() {
    return Boolean(window.AFRAME?.components?.["arjs-anchor"]);
  }

  function isAframeReady() {
    return Boolean(window.AFRAME);
  }

  function waitForLibrary(isLoaded, timeoutMs) {
    timeoutMs = timeoutMs || 20000;
    return new Promise(function (resolve, reject) {
      var start = performance.now();
      function check() {
        if (isLoaded()) {
          resolve();
          return;
        }
        if (performance.now() - start > timeoutMs) {
          reject(new Error("Timeout waiting for AR library"));
          return;
        }
        requestAnimationFrame(check);
      }
      check();
    });
  }

  function loadScript(src, isLoaded) {
    if (isLoaded()) return Promise.resolve();

    function ensureScript() {
      return new Promise(function (resolve, reject) {
        if (document.querySelector('script[src="' + src + '"]')) {
          resolve();
          return;
        }

        var script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = function () {
          resolve();
        };
        script.onerror = function () {
          reject(new Error("Failed to load " + src));
        };
        document.head.appendChild(script);
      });
    }

    return ensureScript().then(function () {
      return waitForLibrary(isLoaded);
    });
  }

  function loadArScripts() {
    if (isArReady()) return Promise.resolve();
    if (arScriptsPromise) return arScriptsPromise;

    var aframeSrc = "https://aframe.io/releases/1.3.0/aframe.min.js";
    var arJsSrc =
      "https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.7/aframe/build/aframe-ar.js";

    var loadArJs = function () {
      return loadScript(arJsSrc, isArReady);
    };

    arScriptsPromise = (window.AFRAME
      ? loadArJs()
      : loadScript(aframeSrc, isAframeReady).then(loadArJs)
    ).catch(function (error) {
      arScriptsPromise = null;
      throw error;
    });

    return arScriptsPromise;
  }

  function getArViewportRect() {
    const viewport = document.querySelector(AR_VIEWPORT_SELECTOR);
    if (!viewport) return null;
    const rect = viewport.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return rect;
  }

  function getArMediaStyles(rect) {
    if (rect) {
      return {
        position: "fixed",
        top: rect.top + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        height: rect.height + "px",
        minHeight: rect.height + "px",
        maxHeight: rect.height + "px",
        margin: "0",
        transform: "none",
      };
    }

    const headerHeight =
      getComputedStyle(document.documentElement).getPropertyValue("--site-header-height").trim() ||
      "4.75rem";
    const bottomOffset =
      getComputedStyle(document.body).getPropertyValue("--ar-bottom-offset").trim() || "0px";
    const viewportHeight = "calc(100dvh - " + headerHeight + " - " + bottomOffset + ")";

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
    };
  }

  function fixArMediaPlacement() {
    const rect = getArViewportRect();
    const sharedStyles = getArMediaStyles(rect);

    const video = document.body.querySelector(":scope > video");
    if (video) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      Object.assign(video.style, sharedStyles, {
        objectFit: "cover",
        objectPosition: "center center",
        zIndex: "1",
      });
      video.play?.().catch(() => undefined);
    }

    document.body.querySelectorAll(":scope > canvas").forEach((canvas) => {
      Object.assign(canvas.style, sharedStyles, { zIndex: "2" });
    });

    const scene = document.getElementById("ar-scene");
    if (scene) {
      Object.assign(scene.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      const sceneCanvas = scene.canvas || scene.querySelector("canvas.a-canvas");
      if (sceneCanvas) {
        Object.assign(sceneCanvas.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
        });
      }
      try {
        scene.resize?.();
      } catch (_error) {
        // Scene may not be fully initialized yet.
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

  function registerActiveArSession(scene) {
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

  function watchArVideoPlacement() {
    let videoObserver = null;
    let viewportObserver = null;
    let rafId = 0;
    let attempts = 0;

    const attachVideoObserver = (video) => {
      videoObserver?.disconnect();
      videoObserver = new MutationObserver(() => fixArMediaPlacement());
      videoObserver.observe(video, { attributes: true, attributeFilter: ["style"] });
    };

    const tick = () => {
      fixArMediaPlacement();
      const video = document.body.querySelector(":scope > video");
      if (video) attachVideoObserver(video);
      attempts += 1;
      if (attempts < 240) rafId = requestAnimationFrame(tick);
    };

    tick();

    const bodyObserver = new MutationObserver(() => {
      fixArMediaPlacement();
      const video = document.body.querySelector(":scope > video");
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

  function cleanupArResources() {
    if (activeArSession) {
      try {
        activeArSession.arSource?.dispose?.();
        activeArSession.arContext?.dispose?.();
      } catch (_) {}
      activeArSession = null;
    }

    const scene = document.getElementById("ar-scene") || document.querySelector("a-scene");
    if (scene) {
      try {
        scene.systems?.arjs?._arSession?.arSource?.dispose?.();
        scene.systems?.arjs?._arSession?.arContext?.dispose?.();
        scene.pause?.();
        scene.destroy?.();
      } catch (_) {}
      scene.remove();
    }

    document.querySelectorAll("video").forEach((video) => {
      video.srcObject?.getTracks?.().forEach((track) => track.stop());
      video.srcObject = null;
      video.remove();
    });

    document.body.querySelectorAll(":scope > canvas").forEach((canvas) => canvas.remove());
    document.body.removeAttribute("style");
    document.documentElement.removeAttribute("style");
  }

  const GALLERY_DB = "modelagem2026-gallery";
  const GALLERY_STORE = "photos";

  function openGalleryDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(GALLERY_DB, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(GALLERY_STORE)) {
          db.createObjectStore(GALLERY_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function loadGalleryPhotos() {
    const db = await openGalleryDB();
    return new Promise((resolve, reject) => {
      const request = db.transaction(GALLERY_STORE, "readonly").objectStore(GALLERY_STORE).getAll();
      request.onsuccess = () => {
        resolve((request.result || []).sort((a, b) => b.createdAt - a.createdAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async function savePhotoToGallery(dataUrl) {
    const db = await openGalleryDB();
    const photo = { id: Date.now(), dataUrl, createdAt: Date.now() };
    return new Promise((resolve, reject) => {
      const request = db.transaction(GALLERY_STORE, "readwrite").objectStore(GALLERY_STORE).add(photo);
      request.onsuccess = () => resolve(photo);
      request.onerror = () => reject(request.error);
    });
  }

  function composePhoto() {
    return new Promise((resolve) => {
      const scene = document.getElementById("ar-scene");
      const video = document.querySelector("video");
      const arCanvas = scene?.canvas;
      if (!arCanvas || !video || video.readyState < 2) {
        resolve(null);
        return;
      }

      requestAnimationFrame(() => {
        const viewport = getArViewportRect();
        const viewWidth = viewport?.width ?? window.innerWidth;
        const viewHeight = viewport?.height ?? window.innerHeight;
        const output = document.createElement("canvas");
        const ctx = output.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const videoRatio = videoWidth / videoHeight;
        const viewRatio = viewWidth / viewHeight;
        let sourceX, sourceY, sourceWidth, sourceHeight;

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

        ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, viewWidth, viewHeight);
        ctx.drawImage(arCanvas, 0, 0, viewWidth, viewHeight);
        resolve(output.toDataURL("image/png"));
      });
    });
  }

  function updateGalleryThumb(photos) {
    const btn = document.getElementById("ar-gallery-btn");
    if (!btn) return;
    if (photos[0]) {
      btn.innerHTML = '<img src="' + photos[0].dataUrl + '" alt="Última foto">';
    }
  }

  async function refreshGallery() {
    try {
      const photos = await loadGalleryPhotos();
      updateGalleryThumb(photos);
      return photos;
    } catch (_) {
      return [];
    }
  }

  async function verifyPatternMarker(patternPath) {
    try {
      const response = await fetch(resolvePublicUrl(patternPath));
      if (!response.ok) return false;
      const text = await response.text();
      return text.trim().length > 0 && text.includes("255");
    } catch (_) {
      return false;
    }
  }

  function appendModelEntity(parent, id, src, scale, position, rotation) {
    const s = scale || [1, 1, 1];
    const p = position || [0, 0, 0];
    const r = rotation || [0, 0, 0];

    const entity = document.createElement("a-entity");
    entity.id = id;
    entity.setAttribute("gltf-model", resolvePublicUrl(src));
    entity.setAttribute("position", p.join(" "));
    entity.setAttribute("rotation", r.join(" "));
    entity.setAttribute("scale", s.join(" "));
    parent.appendChild(entity);
    return entity;
  }

  function mountArScene(host, config, callbacks) {
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
    marker.setAttribute("size", String(config.markerSize || 1));
    marker.setAttribute("min-confidence", "0.45");
    marker.setAttribute("smooth", "true");

    if (config.backgroundModel) {
      const bg = config.backgroundModel;
      appendModelEntity(
        marker,
        "ar-background-entity",
        bg.src,
        bg.scale,
        bg.position,
        bg.rotation,
      );
    }

    appendModelEntity(
      marker,
      "ar-model-entity",
      config.modelSrc,
      config.scale,
      config.position,
      config.rotation,
    );

    const camera = document.createElement("a-entity");
    camera.setAttribute("camera", "");

    scene.appendChild(marker);
    scene.appendChild(camera);
    host.appendChild(scene);

    if (callbacks?.onMarkerFound) marker.addEventListener("markerFound", callbacks.onMarkerFound);
    if (callbacks?.onMarkerLost) marker.addEventListener("markerLost", callbacks.onMarkerLost);
    if (callbacks?.onSceneLoaded) {
      scene.addEventListener("loaded", () => callbacks.onSceneLoaded(scene), { once: true });
    }

    return scene;
  }

  function initArPage(config) {
    if (location.protocol === "file:") {
      document.body.classList.add("is-file-protocol");
    }

    const host = document.getElementById("ar-scene-host");
    const loading = document.getElementById("ar-loading");
    const controls = document.getElementById("ar-controls");
    const shutter = document.getElementById("ar-shutter");
    const galleryBtn = document.getElementById("ar-gallery-btn");
    const modal = document.getElementById("ar-photo-modal");
    const modalImg = document.getElementById("ar-photo-modal-img");

    if (!host || !config) return;

    document.body.classList.add("ar-active", "ar-page", "has-mobile-nav");

    const statusHint = document.getElementById("ar-status-hint");

    loadArScripts()
      .then(async () => {
        const patternOk = await verifyPatternMarker(config.markerPattern);
        if (!patternOk) {
          if (loading) loading.textContent = "Não foi possível carregar o arquivo do marcador (.patt).";
          return;
        }

        mountArScene(host, config, {
          onMarkerFound: () => {
            if (statusHint) statusHint.textContent = "Marcador detectado — ajuste a distância se o modelo não aparecer";
          },
          onMarkerLost: () => {
            if (statusHint) statusHint.textContent = "Aponte para o marcador impresso para visualizar a experiência";
          },
          onSceneLoaded: (sceneEl) => registerActiveArSession(sceneEl),
        });

        try {
          stopWatching = watchArVideoPlacement();
          loading?.remove();
          controls?.classList.remove("is-hidden");
          refreshGallery();
        } catch (cause) {
          console.error("AR placement failed:", cause);
          if (loading) loading.textContent = "Não foi possível iniciar a câmera AR.";
        }
      })
      .catch((cause) => {
        console.error("AR init failed:", cause);
        if (loading) {
          const detail = cause && cause.message ? " (" + cause.message + ")" : "";
          loading.textContent = "Não foi possível carregar a experiência AR." + detail;
        }
      });

    shutter?.addEventListener("click", async () => {
      const dataUrl = await composePhoto();
      if (!dataUrl) {
        alert("Aguarde a câmera carregar antes de capturar.");
        return;
      }
      try {
        await savePhotoToGallery(dataUrl);
        await refreshGallery();
      } catch (_) {
        alert("Não foi possível salvar a foto neste dispositivo.");
      }
      const link = document.createElement("a");
      link.download = "modelagem2026-" + Date.now() + ".png";
      link.href = dataUrl;
      link.click();
    });

    galleryBtn?.addEventListener("click", async () => {
      const photos = await refreshGallery();
      if (!photos.length) {
        alert("Nenhuma foto capturada ainda.");
        return;
      }
      if (modal && modalImg) {
        modalImg.src = photos[0].dataUrl;
        modal.classList.add("is-open");
      }
    });

    document.getElementById("ar-photo-close")?.addEventListener("click", () => {
      modal?.classList.remove("is-open");
    });

    window.addEventListener("beforeunload", () => {
      stopWatching?.();
      cleanupArResources();
      document.body.classList.remove("ar-active");
    });

    document.querySelectorAll('[data-leave-ar="true"]').forEach((el) => {
      el.addEventListener("click", () => {
        stopWatching?.();
        cleanupArResources();
        document.body.classList.remove("ar-active");
      });
    });
  }

  window.StaticAr = { initArPage, cleanupArResources, refreshGallery };

  if (location.protocol === "file:") {
    document.documentElement.classList.add("is-file-protocol");
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("is-file-protocol");
    });
  }
})();
