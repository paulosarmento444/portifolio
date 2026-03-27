"use client";

import { DrawerShell, PageHeader, SectionShell, StatusBadge, SurfaceCard } from "@site/shared";
import type { AccountOverviewView } from "@site/shared";
import {
  ACCOUNT_MENU_LABELS,
  useAccountDashboardState,
} from "../data/hooks/use-account-dashboard-state.hook";
import { AccountSidebar } from "./account-sidebar.component";
import { AccountContent } from "./account-content.component";
import { MobileMenuButton } from "./mobile-menu-button.component";

interface AccountDashboardClientProps {
  overview: AccountOverviewView;
}

export function AccountDashboardClient({ overview }: AccountDashboardClientProps) {
  const {
    selectedMenu,
    currentMenuLabel,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    customer,
    setCustomer,
    displayName,
    userEmail,
    roleLabel,
    handleMenuClick,
  } = useAccountDashboardState({ overview });

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
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              currentLabel={currentMenuLabel}
              controlsId="account-mobile-navigation"
            />
          </div>
        }
      />

      <SectionShell container="utility" spacing="compact" stack="page">
        <div className="lg:hidden">
          <SurfaceCard tone="soft" padding="compact" className="site-stack-panel">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="info">{currentMenuLabel}</StatusBadge>
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
              userEmail={userEmail}
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
          userEmail={userEmail}
          roleLabel={roleLabel}
          orderCount={overview.orders.length}
          mobile
        />
      </DrawerShell>
    </div>
  );
}
