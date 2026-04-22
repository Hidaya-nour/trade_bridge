import type { UserRole } from "@/features/auth/auth.types";
import { roleNavigationConfig } from "./navigationConfig";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
  section?: string;
}

export const roleDefaultRoute: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  retailer: "/retailer/dashboard",
  distributor: "/distributor/dashboard",
  factory: "/factory/dashboard",
  driver: "/driver/dashboard",
};

export const roleNavigation = roleDefaultRoute;

export const roleSidebarNavigation: Record<UserRole, SidebarNavItem[]> = {
  admin: [
    ...roleNavigationConfig.admin.tabs.map((item) => ({ ...item, section: "Primary" })),
    ...roleNavigationConfig.admin.drawer.map((item) => ({ ...item, section: "More" })),
  ],
  retailer: [
    ...roleNavigationConfig.retailer.tabs.map((item) => ({ ...item, section: "Primary" })),
    ...roleNavigationConfig.retailer.drawer.map((item) => ({ ...item, section: "More" })),
  ],
  distributor: [
    ...roleNavigationConfig.distributor.tabs.map((item) => ({ ...item, section: "Primary" })),
    ...roleNavigationConfig.distributor.drawer.map((item) => ({ ...item, section: "More" })),
  ],
  factory: [
    ...roleNavigationConfig.factory.tabs.map((item) => ({ ...item, section: "Primary" })),
    ...roleNavigationConfig.factory.drawer.map((item) => ({ ...item, section: "More" })),
  ],
  driver: [
    ...roleNavigationConfig.driver.tabs.map((item) => ({ ...item, section: "Primary" })),
    ...roleNavigationConfig.driver.drawer.map((item) => ({ ...item, section: "More" })),
  ],
};

export const getRouteTitle = (pathname: string) => {
  const clean = pathname.replace(/\?.*$/, "").replace(/^\//, "");
  const parts = clean.split("/").filter(Boolean);

  if (parts.length === 0) {
    return "Dashboard";
  }

  if (parts.length >= 2) {
    const segment = parts[1];
    if (segment === "dashboard") return "Dashboard";
    if (segment === "orders") return "Orders";
    if (segment === "products") return "Products";
    if (segment === "suppliers") return "Suppliers";
    if (segment === "cart") return "Cart";
    if (segment === "compare") return "Compare Suppliers";
    if (segment === "deliveries") return "Deliveries";
    if (segment === "tracking") return "Tracking";
    if (segment === "notifications") return "Notifications";
    if (segment === "messages") return "Messages";
    if (segment === "profile") return "Profile";
    if (segment === "support") return "Help & Support";
    if (segment === "settings") return "Settings";
    if (segment === "users") return "Users";
    if (segment === "agents") return "Agents";
    if (segment === "marketplace") return "Purchase Products";
    if (segment === "delivery") return "Delivery";
    if (segment === "forecast") return "Forecast";
    if (segment === "promotions") return "Promotions";
    if (segment === "purchase-orders") return "Purchase Orders";
    if (segment === "announcements") return "Announcements";
  }

  return parts[parts.length - 1]
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
