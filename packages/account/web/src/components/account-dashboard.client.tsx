"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DrawerShell, PageHeader, SectionShell, StatusBadge, SurfaceCard } from "@site/shared";
import type { AccountOverviewView } from "@site/shared";
import type { AccountMenu } from "../lib/account.types";
import { AccountSidebar } from "./account-sidebar.component";
import { AccountContent } from "./account-content.component";
import { MobileMenuButton } from "./mobile-menu-button.component";

interface AccountDashboardClientProps {
  overview: AccountOverviewView;
}

const normalizeMenu = (value: string | null): AccountMenu => {
  switch (value) {
    case "orders":
    case "account":
    case "addresses":
    case "logout":
      return value;
    default:
      return "welcome";
  }
};

const menuLabels: Record<AccountMenu, string> = {
  welcome: "Visão geral",
  orders: "Pedidos",
  account: "Conta",
  addresses: "Endereços",
  logout: "Sair",
};

export function AccountDashboardClient({ overview }: AccountDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<AccountMenu>(
    normalizeMenu(searchParams.get("menu")),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState(overview.customer ?? null);

  const displayName = useMemo(
    () => customer?.displayName || overview.viewer.displayName,
    [customer?.displayName, overview.viewer.displayName],
  );
  const roleLabel = overview.viewer.roleLabels[0] || "Cliente";

  useEffect(() => {
    setSelectedMenu(normalizeMenu(searchParams.get("menu")));
  }, [searchParams]);

  const handleMenuClick = (menu: AccountMenu) => {
    setSelectedMenu(menu);
    setIsMobileMenuOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", menu);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="site-page-shell site-page-shell-compact">
      <PageHeader
        container="utility"
        divider
        eyebrow="Minha conta"
        title={`Olá, ${displayName}`}
        description="Gerencie seus pedidos, dados pessoais e endereços com uma navegação mais clara e direta."
        actions={
          <div className="w-full lg:hidden">
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen((current) => !current)}
              currentLabel={menuLabels[selectedMenu]}
              controlsId="account-mobile-navigation"
            />
          </div>
        }
      />

      <SectionShell container="utility" spacing="compact" stack="page">
        <div className="lg:hidden">
          <SurfaceCard tone="soft" padding="compact" className="site-stack-panel">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="info">{menuLabels[selectedMenu]}</StatusBadge>
              <StatusBadge tone="neutral">
                {overview.orders.length} pedido{overview.orders.length === 1 ? "" : "s"}
              </StatusBadge>
            </div>
            <p className="site-text-meta">
              Use o menu para alternar rápido entre pedidos, conta e endereços sem sair do contexto atual.
            </p>
          </SurfaceCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <AccountSidebar
              selectedMenu={selectedMenu}
              onMenuClick={handleMenuClick}
              userName={displayName}
              userEmail={customer?.email || overview.viewer.email}
              roleLabel={roleLabel}
              orderCount={overview.orders.length}
            />
          </aside>
          <div>
            <AccountContent
              selectedMenu={selectedMenu}
              viewer={overview.viewer}
              orders={overview.orders}
              posts={overview.posts}
              customer={customer}
              onCustomerChange={setCustomer}
              onMenuChange={handleMenuClick}
            />
          </div>
        </div>
      </SectionShell>

      <DrawerShell
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        side="bottom"
        panelId="account-mobile-navigation"
        title="Menu da conta"
        description="Acesse pedidos, perfil, endereços e logout."
        contentClassName="pr-0"
      >
        <AccountSidebar
          selectedMenu={selectedMenu}
          onMenuClick={handleMenuClick}
          userName={displayName}
          userEmail={customer?.email || overview.viewer.email}
          roleLabel={roleLabel}
          orderCount={overview.orders.length}
          mobile
        />
      </DrawerShell>
    </div>
  );
}
