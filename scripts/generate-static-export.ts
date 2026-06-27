import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pieces, type ArModelPlacement } from "../lib/pieces";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "export");
const templatesDir = join(__dirname, "static-export");
const LIVE_URL = "https://modelagem2026.vercel.app";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rel(publicPath: string): string {
  if (!publicPath) return publicPath;
  if (/^https?:\/\//i.test(publicPath)) return publicPath;
  return publicPath.replace(/^\//, "");
}

function header(active: string): string {
  const piece = pieces[0];
  const links = [
    { href: "index.html", label: "Início" },
    { href: `${piece.slug}.html`, label: "Exposição" },
    { href: "sobre.html", label: "Sobre" },
  ];

  return `<header class="site-header">
  <div class="site-header__inner">
    <a href="index.html"><img class="site-header__logo" src="${rel("/logos/museu-historico-jacinto-de-sousa.png")}" alt="Museu Histórico Jacinto de Sousa"></a>
    <nav>${links
      .map(
        (l) =>
          `<a href="${l.href}"${active === l.href ? ' class="is-active"' : ""}>${escapeHtml(l.label)}</a>`,
      )
      .join("")}</nav>
  </div>
</header>`;
}

function mobileNav(active: "content" | "ar"): string {
  const piece = pieces[0];
  return `<nav class="mobile-nav" aria-label="Alternar entre conteúdo e realidade aumentada">
  <a href="${piece.slug}.html"${active === "content" ? ' class="is-active"' : ""}>Conteúdo</a>
  <a href="ar.html"${active === "ar" ? ' class="is-active"' : ""} data-leave-ar="true">Experiência RA</a>
</nav>`;
}

function shell(title: string, body: string, options?: { active?: string; mobileNav?: "content" | "ar" }): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — Museu AR</title>
  <link rel="stylesheet" href="css/site.css">
</head>
<body class="${options?.mobileNav ? "has-mobile-nav" : ""}">
  <div class="file-protocol-warning">
    A câmera da RA não funciona abrindo o arquivo direto (file://). Use a versão online em
    <a href="${LIVE_URL}/conteudo/lampiao/ar">${LIVE_URL}/conteudo/lampiao/ar</a>
    ou um servidor local: <code>npm run export:serve</code> → <code>http://localhost:3004</code>
  </div>
  ${header(options?.active ?? "index.html")}
  ${body}
  ${options?.mobileNav ? mobileNav(options.mobileNav) : ""}
</body>
</html>`;
}

function copyPublicAssets(): void {
  const dirs = ["models", "markers", "images", "logos", "assets"];
  for (const dir of dirs) {
    cpSync(join(root, "public", dir), join(outDir, dir), { recursive: true, force: true });
  }
}

function buildIndex(): string {
  const piece = pieces[0];
  return shell(
    "Sombras que assombram",
    `<main class="landing">
  <img class="landing__logo" src="${rel("/logos/museu-historico-jacinto-de-sousa.png")}" alt="Museu Histórico Jacinto de Sousa">
  <h1 class="font-display landing__title">
    Uma experiência em Realidade Aumentada:
    <span class="landing__accent">Sombras que assombram.</span>
  </h1>
  <p class="landing__desc">Trabalho desenvolvido para a disciplina de Modelagem Tridimensional no curso de Design Digital na UFC Campus Quixadá.</p>
  <a class="btn btn--primary" href="${piece.slug}.html" style="margin-top:2.5rem">Entrar agora</a>
</main>`,
    { active: "index.html" },
  );
}

function buildPiecePage(piece: (typeof pieces)[0]): string {
  const bodyHtml = piece.body.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n        ");
  const closingHtml = piece.closing
    ? `<h2 class="font-display" style="margin-top:2.5rem;font-size:1.75rem">${escapeHtml(piece.closing.heading)}</h2><p>${escapeHtml(piece.closing.text)}</p>`
    : "";
  const galleryHtml = piece.gallery
    .map((src) => `<img src="${rel(src)}" alt="Galeria — ${escapeHtml(piece.title)}">`)
    .join("\n          ");

  return shell(
    piece.title,
    `<main class="content content-grid">
  <section>
    <p class="tagline">Acervo digital</p>
    <h1 class="font-display">${escapeHtml(piece.title)}</h1>
    <p class="subtitle">${escapeHtml(piece.subtitle)}</p>
    ${bodyHtml}
    ${closingHtml}
    <div style="margin-top:2rem;display:flex;gap:0.75rem;flex-wrap:wrap">
      <a class="btn btn--primary" href="ar.html">Realidade aumentada</a>
      <a class="btn btn--outline" href="index.html">Voltar ao início</a>
    </div>
    <h2 class="font-display" style="margin-top:2.5rem;font-size:1.75rem">Galeria</h2>
    <div class="gallery">${galleryHtml}</div>
  </section>
  <section>
    <div class="model-shell">
      <model-viewer
        src="${rel(piece.model?.src ?? "")}"
        poster="${rel(piece.model?.poster ?? piece.cover)}"
        alt="${escapeHtml(piece.title)}"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        shadow-intensity="1"
        ar
        ar-modes="webxr scene-viewer quick-look">
      </model-viewer>
    </div>
  </section>
</main>
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>`,
    { active: `${piece.slug}.html`, mobileNav: "content" },
  );
}

function mapModelPlacements(models: ArModelPlacement[] | undefined) {
  return models?.map((model) => ({
    src: rel(model.src),
    scale: model.scale ?? [1, 1, 1],
    position: model.position ?? [0, 0, 0],
    rotation: model.rotation ?? [0, 0, 0],
  }));
}

function buildArConfig(piece: (typeof pieces)[0]): Record<string, unknown> {
  const backgroundModels = mapModelPlacements(piece.ar?.backgroundModels);
  const showPrimaryModel = piece.ar?.showPrimaryModel !== false;

  return {
    ...(showPrimaryModel ? { modelSrc: rel(piece.model?.src ?? "") } : { showPrimaryModel: false }),
    markerPattern: rel(piece.ar?.markerPattern ?? "/markers/lampiao.patt"),
    markerImage: rel(piece.ar?.markerImage ?? "/markers/lampiao-marker.png"),
    markerSize: piece.ar?.markerSize ?? 1,
    scale: piece.ar?.scale ?? [1, 1, 1],
    position: piece.ar?.position ?? [0, 0, 0],
    rotation: piece.ar?.rotation ?? [0, 0, 0],
    ...(backgroundModels?.length ? { backgroundModels } : {}),
    title: piece.title,
  };
}

function arExperienceMarkup(piece: (typeof pieces)[0]): string {
  return `<div class="ar-viewport" data-ar-viewport>
  <div id="ar-scene-host" style="position:absolute;inset:0;z-index:1"></div>
  <div class="ar-overlay">
    <div class="ar-card">
      <div>
        <p class="ar-card__title">${escapeHtml(piece.title)}</p>
        <p class="ar-card__hint" id="ar-status-hint">Aponte para o marcador impresso para visualizar a experiência</p>
        <a href="${rel("/markers/lampiao-marcador.pdf")}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:0.5rem;font-size:0.75rem;color:rgba(255,255,255,0.9);text-decoration:underline">Baixar marcador para impressão</a>
      </div>
      <img class="ar-card__marker" src="${rel(piece.ar?.markerImage ?? "/markers/lampiao-marker.png")}" alt="Marcador da exposição">
    </div>
  </div>
  <div id="ar-loading" class="ar-loading">Iniciando câmera e cena AR…</div>
  <div id="ar-controls" class="ar-controls is-hidden">
    <div style="width:3.25rem"></div>
    <button id="ar-shutter" type="button" class="ar-shutter" aria-label="Capturar foto"><span></span></button>
    <button id="ar-gallery-btn" type="button" class="ar-gallery-btn" aria-label="Abrir galeria">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <path d="M21 15l-5-5L5 21"></path>
      </svg>
    </button>
  </div>
</div>
<div id="ar-photo-modal" class="ar-modal">
  <div class="ar-modal__bar">
    <button id="ar-photo-close" type="button">Fechar</button>
  </div>
  <img id="ar-photo-modal-img" alt="Foto AR">
</div>
<script>
  window.__AR_CONFIG__ = ${JSON.stringify(buildArConfig(piece))};
</script>
<script src="js/ar-runtime.js"></script>
<script>
  StaticAr.initArPage(window.__AR_CONFIG__);
</script>`;
}

function buildArPage(piece: (typeof pieces)[0]): string {
  return shell(`AR — ${piece.title}`, arExperienceMarkup(piece), {
    active: `${piece.slug}.html`,
    mobileNav: "ar",
  });
}

function buildArStandalonePage(piece: (typeof pieces)[0]): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RA — ${escapeHtml(piece.title)}</title>
  <link rel="stylesheet" href="css/site.css">
</head>
<body class="ar-standalone">
  <div class="file-protocol-warning">
    A câmera da RA não funciona abrindo o arquivo direto (file://). Use a versão online em
    <a href="${LIVE_URL}/conteudo/lampiao/ar">${LIVE_URL}/conteudo/lampiao/ar</a>
    ou um servidor local: <code>npm run export:serve</code> → <code>http://localhost:3004/ra.html</code>
  </div>
  ${arExperienceMarkup(piece)}
</body>
</html>`;
}

function buildMarcadorLampiaoPage(piece: (typeof pieces)[0]): string {
  const markerImage = rel(piece.ar?.markerImage ?? "/markers/lampiao-marker.png");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Marcador — ${escapeHtml(piece.title)} — Museu AR</title>
  <link rel="stylesheet" href="css/site.css">
</head>
<body class="marcador-lampiao-page">
  <div class="marcador-lampiao-page__shell">
    <div class="marcador-lampiao-page__main">
      <div class="marcador-lampiao-page__viewer marcador-lampiao-model-shell">
        <model-viewer
          src="${rel(piece.model?.src ?? "")}"
          poster="${rel(piece.model?.poster ?? piece.cover)}"
          alt="${escapeHtml(piece.title)}"
          camera-controls
          touch-action="pan-y"
          auto-rotate
          shadow-intensity="1"
          ar
          ar-modes="webxr scene-viewer quick-look">
        </model-viewer>
      </div>
    </div>
    <footer class="marcador-lampiao-page__footer">
      <img
        class="marcador-lampiao-page__marker"
        src="${markerImage}"
        alt="Marcador AR da exposição Lampião">
    </footer>
  </div>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
</body>
</html>`;
}

function buildSobre(): string {
  return shell(
    "Sobre",
    `<main class="content">
  <h1 class="font-display">Sobre</h1>
  <p>Projeto de modelagem tridimensional e realidade aumentada desenvolvido para a exposição de 2026. A identidade visual é inspirada na fachada rosa do museu — pilastras brancas, molduras ornamentais e iluminação magenta.</p>
  <p>O site combina conteúdo editorial, visualização 3D com <code>model-viewer</code> e experiências AR com AR.js sobre marcadores personalizados.</p>
  <p>Marcadores customizados podem ser gerados no <a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html" target="_blank" rel="noreferrer">treinador oficial do AR.js</a>.</p>
  <a class="btn btn--outline" href="${pieces[0].slug}.html" style="margin-top:1.5rem">Ver exposição</a>
</main>`,
    { active: "sobre.html" },
  );
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, "css"), { recursive: true });
mkdirSync(join(outDir, "js"), { recursive: true });

copyPublicAssets();
writeFileSync(join(outDir, "css", "site.css"), readFileSync(join(templatesDir, "site.css"), "utf8"));
writeFileSync(join(outDir, "js", "ar-runtime.js"), readFileSync(join(templatesDir, "ar-runtime.js"), "utf8"));
writeFileSync(join(outDir, "index.html"), buildIndex(), "utf8");
writeFileSync(join(outDir, "sobre.html"), buildSobre(), "utf8");
writeFileSync(join(outDir, "ar.html"), buildArPage(pieces[0]), "utf8");
writeFileSync(join(outDir, "ra.html"), buildArStandalonePage(pieces[0]), "utf8");
writeFileSync(join(outDir, "marcador-lampiao.html"), buildMarcadorLampiaoPage(pieces[0]), "utf8");

for (const piece of pieces) {
  writeFileSync(join(outDir, `${piece.slug}.html`), buildPiecePage(piece), "utf8");
}

console.log(`Export estático gerado em ${outDir}`);
console.log("Para testar com RA: npm run export:serve");
