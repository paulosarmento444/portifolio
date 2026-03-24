import Image from "next/image";
import React from "react";

export const Logo = () => (
    <Image
        src="/logo.webp"
        alt="Solar Esportes"
        width={130}
        height={44}
        priority
        className="cursor-pointer h-auto w-auto select-none"
    />
);
