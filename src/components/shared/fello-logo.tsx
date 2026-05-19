export const FELLO_LOGO_SRC = "/logo.svg";

type FelloLogoProps = {
  size?: number;
  className?: string;
};

export function FelloLogo({ size = 36, className }: FelloLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FELLO_LOGO_SRC}
      alt="Fello"
      width={size}
      height={size}
      className={className}
    />
  );
}
