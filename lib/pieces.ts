export type ArModelId = "suzane";

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
];

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((piece) => piece.slug === slug);
}
