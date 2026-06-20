export type ArModelId = "lampiao";

export type ArModelPlacement = {
  src: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
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
    backgroundModels?: ArModelPlacement[];
  };
};

/** Lampião deitado no plano do marcador (leitura de frente). */
const AR_LAMP_FLAT_ROTATION: [number, number, number] = [-90, 0, 0];
/** Fantasmas em pé, de frente para a câmera. */
const AR_GHOST_ROTATION: [number, number, number] = [0, 0, 0];
/**
 * Metros no plano do marcador.
 * Na leitura frontal, −Z recua para o fundo da cena (+Z empurrava os vultos para baixo na tela).
 */
const AR_GHOST_DEPTH_M = -0.95;
/** Metros — distância lateral entre centros dos três fantasmas. */
const AR_GHOST_SPREAD_M = 0.38;

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
      scale: [0.42, 0.42, 0.42],
      position: [0, 0, 0],
      rotation: AR_LAMP_FLAT_ROTATION,
      markerPattern: "/markers/lampiao.patt",
      markerImage: "/markers/lampiao-marker.png",
      markerSize: 1,
      backgroundModels: [
        {
          src: "/models/vulto.glb",
          scale: [0.38, 0.38, 0.38],
          position: [-AR_GHOST_SPREAD_M, 0, AR_GHOST_DEPTH_M],
          rotation: AR_GHOST_ROTATION,
        },
        {
          src: "/models/vulto.glb",
          scale: [0.38, 0.38, 0.38],
          position: [0, 0, AR_GHOST_DEPTH_M],
          rotation: AR_GHOST_ROTATION,
        },
        {
          src: "/models/vulto.glb",
          scale: [0.38, 0.38, 0.38],
          position: [AR_GHOST_SPREAD_M, 0, AR_GHOST_DEPTH_M],
          rotation: AR_GHOST_ROTATION,
        },
      ],
    },
  },
];

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((piece) => piece.slug === slug);
}
