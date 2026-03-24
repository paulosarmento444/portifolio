"use client";

import { ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { EmptyState, SectionShell, cn, ecommerceButtonStyles } from "@site/shared";

export function EmptyCart() {
  return (
    <SectionShell container="utility" spacing="compact" stack="section">
      <EmptyState
        icon={<ShoppingCart className="h-6 w-6" />}
        eyebrow="Carrinho vazio"
        title="Seu carrinho ainda não tem produtos"
        description="Explore o catálogo, descubra as categorias em destaque e volte para concluir a compra quando quiser."
        action={
          <Link href="/store" className={cn(ecommerceButtonStyles.primary, "justify-center")}>
            Explorar produtos
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    </SectionShell>
  );
}
