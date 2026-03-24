import Link from "next/link";
import { BreadcrumbTrail } from "@site/shared";

export function StoreBreadcrumbs() {
  return (
    <BreadcrumbTrail
      items={[
        { label: "Home", href: "/" },
        { label: "Loja", current: true },
      ]}
      renderLink={(item, className) => (
        <Link href={item.href || "/"} className={className}>
          {item.label}
        </Link>
      )}
    />
  );
}
