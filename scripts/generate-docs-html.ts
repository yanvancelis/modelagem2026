import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pieces } from "../lib/pieces";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "docs", "html");
const assetsDir = join(outDir, "assets");

const SITE_TITLE = "Museu AR — Modelagem Tridimensional 2026";
const LIVE_URL = "https://modelagem2026.vercel.app";

const styles = `
  :root {
    color-scheme: light;
    --bg: #fffbfc;
    --fg: #1a1216;
    --muted: #6b5a62;
    --accent: #d85a82;
    --border: #e8d4dc;
    --surface: #ffffff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    background: var(--bg);
    color: var(--fg);
    line-height: 1.65;
  }
  header {
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    padding: 1.25rem 1.5rem;
  }
  header a { color: inherit; text-decoration: none; }
  header nav { margin-top: 0.75rem; display: flex; gap: 1rem; flex-wrap: wrap; }
  header nav a { color: var(--accent); font-size: 0.95rem; }
  main { max-width: 42rem; margin: 0 auto; padding: 2rem 1.5rem 3rem; }
  h1, h2 { font-family: "Arial Narrow", Arial, sans-serif; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 700; line-height: 1.15; }
  h1 { font-size: 2rem; margin: 0 0 0.5rem; }
  h2 { font-size: 1.35rem; margin: 2rem 0 0.75rem; }
  .subtitle { color: var(--muted); font-size: 1.05rem; margin: 0 0 1.5rem; }
  .tagline { font-family: "Arial Narrow", Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); font-size: 0.8rem; margin-bottom: 0.5rem; }
  p { margin: 0 0 1rem; }
  a { color: var(--accent); }
  .gallery { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
  .gallery img { max-height: 220px; border: 1px solid var(--border); border-radius: 8px; }
  .marker { max-width: 120px; border: 1px solid var(--border); border-radius: 8px; background: #fff; padding: 0.5rem; }
  footer {
    border-top: 1px solid var(--border);
    padding: 1.5rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .note {
    margin-top: 2rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    font-size: 0.9rem;
  }
  .btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    background: var(--accent);
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-family: "Arial Narrow", Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
  }
`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function page(title: string, body: string, active?: string): string {
  const nav = [
    { href: "index.html", label: "Início" },
    ...pieces.map((p) => ({ href: `${p.slug}.html`, label: p.title })),
    { href: "sobre.html", label: "Sobre" },
  ];

  const navHtml = nav
    .map(
      (item) =>
        `<a href="${item.href}"${active === item.href ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`,
    )
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — ${SITE_TITLE}</title>
  <style>${styles}</style>
</head>
<body>
  <header>
    <a href="index.html"><strong>Museu Histórico Jacinto de Sousa</strong></a>
    <nav>${navHtml}</nav>
  </header>
  <main>${body}</main>
  <footer>
    Documentação estática gerada a partir do projeto Next.js.<br>
    Versão interativa (3D + RA): <a href="${LIVE_URL}">${LIVE_URL}</a>
  </footer>
</body>
</html>`;
}

function assetPath(publicPath: string): string {
  const filename = publicPath.split("/").pop() ?? "asset";
  return `assets/${filename}`;
}

function copyAssets(): void {
  mkdirSync(assetsDir, { recursive: true });

  const files = new Set<string>([
    "public/logos/museu-historico-jacinto-de-sousa.png",
    "public/assets/fachada-museu.png",
    "public/markers/lampiao-marker.png",
  ]);

  for (const piece of pieces) {
    for (const image of piece.gallery) files.add(`public${image}`);
    if (piece.model?.poster) files.add(`public${piece.model.poster}`);
  }

  for (const file of files) {
    cpSync(join(root, file), join(assetsDir, file.split("/").pop()!), { force: true });
  }
}

function buildIndex(): string {
  const piece = pieces[0];
  return page(
    "Início",
    `
    <p class="tagline">Modelagem Tridimensional · UFC Quixadá · 2026</p>
    <h1>Sombras que assombram</h1>
    <p class="subtitle">Uma experiência em Realidade Aumentada</p>
    <p>Trabalho desenvolvido para a disciplina de Modelagem Tridimensional no curso de Design Digital na UFC Campus Quixadá.</p>
    <p>Exposição digital do <strong>${escapeHtml(piece?.title ?? "acervo")}</strong>, com viewer 3D e experiência de realidade aumentada sobre marcador personalizado.</p>
    <a class="btn" href="${piece?.slug ?? "lampiao"}.html">Ver exposição</a>
    <div class="note">
      Este pacote HTML é uma versão estática para documentação. O site completo usa Next.js, HeroUI, model-viewer e AR.js.
    </div>
  `,
    "index.html",
  );
}

function buildPiecePage(piece: (typeof pieces)[number]): string {
  const bodyHtml = piece.body.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n    ");
  const galleryHtml = piece.gallery
    .map(
      (src) =>
        `<img src="${assetPath(src)}" alt="Imagem da galeria — ${escapeHtml(piece.title)}">`,
    )
    .join("\n      ");

  const closingHtml = piece.closing
    ? `<h2>${escapeHtml(piece.closing.heading)}</h2><p>${escapeHtml(piece.closing.text)}</p>`
    : "";

  const markerHtml = piece.ar?.markerImage
    ? `<h2>Marcador AR</h2>
       <p>Imprima ou exiba este padrão para acionar a experiência de realidade aumentada:</p>
       <img class="marker" src="${assetPath(piece.ar.markerImage)}" alt="Marcador de realidade aumentada">`
    : "";

  return page(
    piece.title,
    `
    <p class="tagline">Acervo digital</p>
    <h1>${escapeHtml(piece.title)}</h1>
    <p class="subtitle">${escapeHtml(piece.subtitle)}</p>
    ${bodyHtml}
    ${closingHtml}
    <h2>Galeria</h2>
    <div class="gallery">${galleryHtml}</div>
    ${markerHtml}
    <div class="note">
      Modelo 3D: <code>${escapeHtml(piece.model?.src ?? "—")}</code><br>
      Pattern AR: <code>${escapeHtml(piece.ar?.markerPattern ?? "—")}</code>
    </div>
  `,
    `${piece.slug}.html`,
  );
}

function buildSobre(): string {
  return page(
    "Sobre",
    `
    <h1>Sobre</h1>
    <p>Projeto de modelagem tridimensional e realidade aumentada desenvolvido para a exposição de 2026. A identidade visual é inspirada na fachada rosa do museu — pilastras brancas, molduras ornamentais e iluminação magenta.</p>
    <p>O site combina conteúdo editorial, visualização 3D com <code>model-viewer</code> e experiências AR com AR.js sobre marcadores personalizados.</p>
    <p>Marcadores customizados podem ser gerados no <a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html" target="_blank" rel="noreferrer">treinador oficial do AR.js</a>.</p>
    <h2>Stack técnica</h2>
    <ul>
      <li>Next.js 15 + React 19</li>
      <li>HeroUI + Tailwind CSS v4</li>
      <li>@google/model-viewer (GLB)</li>
      <li>AR.js + A-Frame (marcador pattern)</li>
    </ul>
    <a class="btn" href="${pieces[0]?.slug ?? "lampiao"}.html">Ver exposição</a>
  `,
    "sobre.html",
  );
}

mkdirSync(outDir, { recursive: true });
copyAssets();

writeFileSync(join(outDir, "index.html"), buildIndex(), "utf8");
writeFileSync(join(outDir, "sobre.html"), buildSobre(), "utf8");

for (const piece of pieces) {
  writeFileSync(join(outDir, `${piece.slug}.html`), buildPiecePage(piece), "utf8");
}

console.log(`Documentação HTML gerada em ${outDir}`);
