"use client";

import type {
  AccountCustomerView,
  AccountOrderSummaryView,
  AccountPostSummaryView,
  AuthUserView,
} from "@site/shared";
import { SurfaceCard } from "@site/shared";
import type {
  AccountCustomerChangeHandler,
  AccountMenu,
} from "../lib/account.types";
import { WelcomeSection } from "./sections/welcome-section.component";
import { OrdersSection } from "./sections/orders-section.component";
import { AccountSection } from "./sections/account-section.component";
import { AddressesSection } from "./sections/addresses-section.component";
import { LogoutSection } from "./sections/logout-section.component";

interface AccountContentProps {
  selectedMenu: AccountMenu;
  viewer: AuthUserView;
  orders: AccountOrderSummaryView[];
  posts: AccountPostSummaryView[];
  customer: AccountCustomerView | null;
  onCustomerChange: AccountCustomerChangeHandler;
  onMenuChange: (menu: AccountMenu) => void;
}

export function AccountContent({
  selectedMenu,
  viewer,
  orders,
  posts: _posts,
  customer,
  onCustomerChange,
  onMenuChange,
}: AccountContentProps) {
  const renderContent = () => {
    switch (selectedMenu) {
      case "welcome":
        return (
          <WelcomeSection
            viewer={viewer}
            orders={orders}
            onNavigate={onMenuChange}
          />
        );
      case "orders":
        return <OrdersSection orders={orders} />;
      case "account":
        return (
          <AccountSection
            viewer={viewer}
            customer={customer}
            onCustomerChange={onCustomerChange}
          />
        );
      case "addresses":
        return (
          <AddressesSection
            viewer={viewer}
            customer={customer}
            onCustomerChange={onCustomerChange}
          />
        );
      case "logout":
        return <LogoutSection onCancel={() => onMenuChange("welcome")} />;
      default:
        return (
          <WelcomeSection
            viewer={viewer}
            orders={orders}
            onNavigate={onMenuChange}
          />
        );
    }
  };

  return (
    <SurfaceCard key={selectedMenu} tone="strong" className="min-h-[32rem]">
      {renderContent()}
    </SurfaceCard>
  );
}
