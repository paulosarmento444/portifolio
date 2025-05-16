import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Layout wrapper</h1>
      <div className="border border-dashed border-red-500 p-4">{children}</div>
    </div>
  );
}
