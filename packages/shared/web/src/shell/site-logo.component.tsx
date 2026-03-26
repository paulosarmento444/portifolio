import Image from "next/image";

export function SiteLogo() {
  return (
    <Image
      src="/logo.webp"
      alt="Solar Esportes"
      width={130}
      height={44}
      priority
      className="h-auto w-auto cursor-pointer select-none"
    />
  );
}
