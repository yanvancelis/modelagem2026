export type ArModelId = "padrao" | "coracao" | "escudo" | "suzane";

export type Piece = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string[];
  cover: string;
  gallery: string[];
  arModelId: ArModelId;
  model?: {
    src: string;
    poster?: string;
  };
};

export const pieces: Piece[] = [
  {
    slug: "suzane",
    title: "Suzane",
    subtitle: "Modelo 3D exportado do Blender",
    excerpt:
      "Peça tridimensional em GLB, explorável no viewer web e visível em realidade aumentada sobre o marcador Hiro.",
    body: [
      "Suzane é a peça principal do acervo digital desta exposição. O modelo foi modelado no Blender e exportado em glTF binário (.glb) para uso tanto no navegador quanto na experiência AR.",
      "Na visualização web, você pode rotacionar, dar zoom e inspecionar os detalhes da superfície. Na rota de realidade aumentada, aponte a câmera para o marcador Hiro e veja a peça sobreposta ao ambiente.",
    ],
    cover: "/assets/fachada-museu.png",
    gallery: ["/assets/fachada-museu.png"],
    arModelId: "suzane",
    model: {
      src: "/models/suzane.glb",
      poster: "/assets/fachada-museu.png",
    },
  },
  {
    slug: "escudo",
    title: "Escudo do Vasco",
    subtitle: "Imagem vetorial sobre marcador",
    excerpt:
      "Escudo em SVG com transparência, ancorado ao marcador AR como plano orientado ao visitante.",
    body: [
      "Esta peça demonstra o uso de imagens 2D de alta qualidade em experiências de realidade aumentada. O escudo foi preparado como SVG para preservar nitidez em qualquer escala.",
      "Na experiência AR, a imagem flutua acima do marcador Hiro, mantendo proporção e transparência do fundo.",
    ],
    cover: "/escudo-vasco.svg",
    gallery: ["/escudo-vasco.svg"],
    arModelId: "escudo",
  },
  {
    slug: "coracao",
    title: "Coração 3D",
    subtitle: "Malha procedural em Three.js",
    excerpt:
      "Geometria customizada gerada a partir de vértices e índices, renderizada diretamente na cena A-Frame.",
    body: [
      "O coração é construído em tempo de execução a partir de uma malha triangular definida manualmente — uma referência ao tutorial clássico de modelagem low-poly com Three.js.",
      "Ideal para demonstrar que nem toda peça AR precisa ser um arquivo externo: geometrias procedurais também funcionam muito bem.",
    ],
    cover: "/assets/fachada-museu.png",
    gallery: [],
    arModelId: "coracao",
  },
  {
    slug: "padrao",
    title: "Modelo padrão",
    subtitle: "Esfera e plano — exemplo AR.js",
    excerpt:
      "Demonstração mínima do framework: esfera vermelha e plano verde sobre o marcador Hiro.",
    body: [
      "Peça de referência incluída nos exemplos do AR.js. Útil para validar que a câmera, o marcador e a cena estão funcionando antes de carregar modelos mais complexos.",
    ],
    cover: "/assets/fachada-museu.png",
    gallery: [],
    arModelId: "padrao",
  },
];

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((piece) => piece.slug === slug);
}
