export type ArModelId = "lampiao";

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

export type Piece = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string[];
  closing?: {
    heading: string;
    text: string;
  };
  cover: string;
  gallery: string[];
  arModelId: ArModelId;
  model?: {
    src: string;
    poster?: string;
  };
  ar?: {
    scale: [number, number, number];
    position: [number, number, number];
    rotation?: [number, number, number];
    markerPattern: string;
    markerImage: string;
    markerSize?: number;
    showPrimaryModel?: boolean;
    backgroundModels?: ArModelPlacement[];
  };
};

/** Fantasma deitado no plano do marcador. */
const AR_GHOST_FLAT_ROTATION: [number, number, number] = [-90, 0, 0];
/** Escala ampliada — um único vulto cobrindo o marcador. */
const AR_GHOST_SCALE = 1.85;

export const pieces: Piece[] = [
  {
    slug: "lampiao",
    title: "O lampião e suas sombras",
    subtitle: "Museu Jacinto de Sousa, Quixadá",
    excerpt:
      "Um objeto do sertão cearense cujas sombras, dizem, ainda se movem quando o museu fecha.",
    body: [
      "No Museu Jacinto de Sousa, em Quixadá, os objetos guardam mais do que história. Guardam memória viva, causos passados de geração em geração e, dizem alguns, presenças que nunca foram embora.",
      "O lampião que você vê aqui é um desses objetos. Por anos iluminou casas do sertão cearense, projetando luz onde havia escuridão. Mas quem trabalha no museu sabe: quando o dia fecha e o silêncio toma conta das salas, as sombras que ele deixa nas paredes parecem se mover sozinhas.",
      "Funcionários e visitantes relatam presenças inexplicadas, sons sem origem e formas que surgem e desaparecem. Ninguém sabe ao certo o que são. Mas todos concordam que estão lá.",
    ],
    closing: {
      heading: "Veja por você mesmo",
      text: "Este projeto usa Realidade Aumentada para dar forma a essas histórias. Aponte a câmera do seu celular para o marcador e descubra o que as sombras escondem.",
    },
    cover: "/assets/fachada-museu.png",
    gallery: [
      "/images/lampiao/lampiao-museu.jpg",
      "/assets/fachada-museu.png",
    ],
    arModelId: "lampiao",
    model: {
      src: "/models/lampiao.glb",
      poster: "/assets/fachada-museu.png",
    },
    ar: {
      scale: [1, 1, 1],
      position: [0, 0, 0],
      showPrimaryModel: false,
      markerPattern: "/markers/lampiao.patt",
      markerImage: "/markers/lampiao-marker.png",
      markerSize: 1,
      backgroundModels: [
        {
          src: "/models/vulto.glb",
          scale: [AR_GHOST_SCALE, AR_GHOST_SCALE, AR_GHOST_SCALE],
          position: [0, 0.002, 0],
          rotation: AR_GHOST_FLAT_ROTATION,
          introAnimation: {
            delayMs: 1000,
            offsetY: -0.65,
            durationMs: 1200,
          },
        },
      ],
    },
  },
];

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((piece) => piece.slug === slug);
}
