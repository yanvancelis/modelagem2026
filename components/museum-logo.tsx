type MuseumLogoProps = {
  src: string;
  alt: string;
  className?: string;
};

export function MuseumLogo({ src, alt, className = "" }: MuseumLogoProps) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-block shrink-0 bg-[var(--accent)] ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export const museumLogo = {
  src: "/logos/museu-historico-jacinto-de-sousa.png",
  alt: "Museu Histórico Jacinto de Sousa",
} as const;
