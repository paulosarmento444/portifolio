"use client";

import { motion } from "framer-motion";
import { WelcomeSection } from "./sections/WelcomeSection";
import { OrdersSection } from "./sections/OrdersSection";
import { PostsSection } from "./sections/PostsSection";
import { AccountSection } from "./sections/AccountSection";
import { AddressesSection } from "./sections/AddressesSection";
import { LogoutSection } from "./sections/LogoutSection";

interface AccountContentProps {
  selectedMenu: string;
  viewer: any;
  orders: any[];
  posts: any[];
  customer: any;
  router: any;
}

export function AccountContent({
  selectedMenu,
  viewer,
  orders,
  posts,
  customer,
  router,
}: AccountContentProps) {
  const renderContent = () => {
    switch (selectedMenu) {
      case "welcome":
        return <WelcomeSection viewer={viewer} orders={orders} />;
      case "orders":
        return <OrdersSection orders={orders} />;
      case "posts":
        return <PostsSection posts={posts} />;
      case "account":
        return (
          <AccountSection
            username={viewer.name}
            billing={customer.billing}
            role={customer.role}
          />
        );
      case "addresses":
        return (
          <AddressesSection
            viewer={viewer}
            billing={customer.billing}
            shipping={customer.shipping}
          />
        );

      case "logout":
        return <LogoutSection router={router} />;
      default:
        return <WelcomeSection viewer={viewer} orders={orders} />;
    }
  };

  return (
    <motion.div
      key={selectedMenu}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>

      <div className="relative p-8 md:p-12">{renderContent()}</div>
    </motion.div>
  );
}
