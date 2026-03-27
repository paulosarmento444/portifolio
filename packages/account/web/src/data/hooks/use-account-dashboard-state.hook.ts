"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AccountOverviewView } from "@site/shared";
import type { AccountCustomerView } from "@site/shared";
import type { AccountMenu } from "../account.types";

const normalizeAccountMenu = (value: string | null): AccountMenu => {
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

export const ACCOUNT_MENU_LABELS: Record<AccountMenu, string> = {
  welcome: "Visão geral",
  orders: "Pedidos",
  account: "Conta",
  addresses: "Endereços",
  logout: "Sair",
};

type UseAccountDashboardStateArgs = {
  overview: AccountOverviewView;
};

type UseAccountDashboardStateResult = {
  selectedMenu: AccountMenu;
  currentMenuLabel: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  customer: AccountCustomerView | null;
  setCustomer: (customer: AccountCustomerView | null) => void;
  displayName: string;
  userEmail: string;
  roleLabel: string;
  handleMenuClick: (menu: AccountMenu) => void;
};

export function useAccountDashboardState({
  overview,
}: UseAccountDashboardStateArgs): UseAccountDashboardStateResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState<AccountMenu>(
    normalizeAccountMenu(searchParams?.get("menu") ?? null),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpenState] = useState(false);
  const [customer, setCustomerState] = useState<AccountCustomerView | null>(
    overview.customer ?? null,
  );

  const displayName = useMemo(
    () => customer?.displayName || overview.viewer.displayName,
    [customer?.displayName, overview.viewer.displayName],
  );
  const roleLabel = overview.viewer.roleLabels[0] || "Cliente";
  const userEmail = customer?.email || overview.viewer.email || "";

  useEffect(() => {
    setSelectedMenu(normalizeAccountMenu(searchParams?.get("menu") ?? null));
  }, [searchParams]);

  const handleMenuClick = (menu: AccountMenu) => {
    setSelectedMenu(menu);
    setIsMobileMenuOpenState(false);

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("menu", menu);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    selectedMenu,
    currentMenuLabel: ACCOUNT_MENU_LABELS[selectedMenu],
    isMobileMenuOpen,
    setIsMobileMenuOpen: setIsMobileMenuOpenState,
    customer,
    setCustomer: setCustomerState,
    displayName,
    userEmail,
    roleLabel,
    handleMenuClick,
  };
}
