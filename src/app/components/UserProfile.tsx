import Image from "next/image";
import React from "react";

export const UserProfile = ({ name }: { name: string }) => {
  const displayName = name || "Kids";

  return (
    <div className="flex items-center space-x-4 text-sm font-light">
      <p className="hidden cursor-not-allowed lg:inline">{displayName}</p>
      <Image
        src="/profile.png"
        alt="profile"
        width={44}
        height={44}
        className="rounded cursor-pointer"
      />
    </div>
  );
};
