import { redirect } from "next/navigation";
import { AccountDashboardClient } from "../components/account-dashboard.client";
import { loadAccountOverview } from "../data/loaders/account-overview.loader";

export async function AccountDashboardPage() {
  const overview = await loadAccountOverview();

  if (!overview) {
    redirect("/auth/login");
  }

  return <AccountDashboardClient overview={overview} />;
}
