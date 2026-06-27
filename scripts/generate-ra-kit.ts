import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pieces, type ArModelPlacement, type Piece } from "../lib/pieces";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const kitDir = join(root, "ra-kit");
const templatesDir = join(__dirname, "static-export");
const publicDir = join(root, "public");

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

function mapModelPlacements(models: ArModelPlacement[] | undefined) {
  return models?.map((model) => ({
    src: rel(model.src),
    scale: model.scale ?? [1, 1, 1],
    position: model.position ?? [0, 0, 0],
    rotation: model.rotation ?? [0, 0, 0],
  }));
}

function buildArConfig(piece: Piece): Record<string, unknown> {
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

function arExperienceMarkup(piece: Piece): string {
  return `<div class="ar-viewport" data-ar-viewport>
  <div id="ar-scene-host" style="position:absolute;inset:0;z-index:1"></div>
  <div class="ar-overlay">
    <div class="ar-card">
      <div>
        <p class="ar-card__title">${escapeHtml(piece.title)}</p>
        <p class="ar-card__hint" id="ar-status-hint">Aponte para o marcador impresso para visualizar a experiência</p>
        <a href="markers/lampiao-marcador.pdf" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:0.5rem;font-size:0.75rem;color:rgba(255,255,255,0.9);text-decoration:underline">Baixar marcador para impressão</a>
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

function buildIndexHtml(piece: Piece): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RA — ${escapeHtml(piece.title)}</title>
  <link rel="stylesheet" href="css/ar.css">
</head>
<body class="ar-standalone">
  <div class="file-protocol-warning">
    A câmera da RA não funciona abrindo o arquivo direto (file://). Sirva esta pasta com um servidor local, por exemplo:
    <code>npm run ra-kit:serve</code> → <code>http://localhost:3005</code>
  </div>
  ${arExperienceMarkup(piece)}
</body>
</html>`;
}

const markerFiles = ["lampiao.patt", "lampiao-marker.png", "lampiao-marcador.pdf"];
const modelFiles = ["vulto.glb"];

rmSync(kitDir, { recursive: true, force: true });
mkdirSync(join(kitDir, "css"), { recursive: true });
mkdirSync(join(kitDir, "js"), { recursive: true });
mkdirSync(join(kitDir, "markers"), { recursive: true });
mkdirSync(join(kitDir, "models"), { recursive: true });

for (const file of markerFiles) {
  cpSync(join(publicDir, "markers", file), join(kitDir, "markers", file));
}

for (const file of modelFiles) {
  cpSync(join(publicDir, "models", file), join(kitDir, "models", file));
}

writeFileSync(join(kitDir, "css", "ar.css"), readFileSync(join(templatesDir, "ar-only.css"), "utf8"));
writeFileSync(join(kitDir, "js", "ar-runtime.js"), readFileSync(join(templatesDir, "ar-runtime.js"), "utf8"));
writeFileSync(join(kitDir, "index.html"), buildIndexHtml(pieces[0]), "utf8");

console.log(`Kit RA gerado em ${kitDir}`);
console.log("Para testar: npm run ra-kit:serve → http://localhost:3005");
