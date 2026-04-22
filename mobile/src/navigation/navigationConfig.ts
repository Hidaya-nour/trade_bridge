import { Ionicons } from "@expo/vector-icons";
import type { UserRole } from "@/features/auth/auth.types";

export type NavigationItemKind = "tab" | "drawer";

export interface RoleNavigationItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  screen: string;
  kind: NavigationItemKind;
}

export interface RoleNavigationConfig {
  tabs: RoleNavigationItem[];
  drawer: RoleNavigationItem[];
  hiddenScreens: string[];
}

const sharedDrawerItems = (role: UserRole): RoleNavigationItem[] => [
  {
    key: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
    href: `/${role}/notifications`,
    screen: "notifications",
    kind: "drawer",
  },
  {
    key: "messages",
    label: "Messages",
    icon: "chatbubble-ellipses-outline",
    href: `/${role}/messages`,
    screen: "messages",
    kind: "drawer",
  },
  {
    key: "support",
    label: "Help & Support",
    icon: "help-circle-outline",
    href: `/${role}/support`,
    screen: "support",
    kind: "drawer",
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings-outline",
    href: `/${role}/settings`,
    screen: "settings",
    kind: "drawer",
  },
];

export const roleNavigationConfig: Record<UserRole, RoleNavigationConfig> = {
  retailer: {
    tabs: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: "grid-outline",
        href: "/retailer/dashboard",
        screen: "dashboard",
        kind: "tab",
      },
      {
        key: "products",
        label: "Products",
        icon: "storefront-outline",
        href: "/retailer/products",
        screen: "products",
        kind: "tab",
      },
      {
        key: "suppliers",
        label: "Suppliers",
        icon: "business-outline",
        href: "/retailer/suppliers",
        screen: "suppliers",
        kind: "tab",
      },
      {
        key: "orders",
        label: "Orders",
        icon: "receipt-outline",
        href: "/retailer/orders",
        screen: "orders",
        kind: "tab",
      },
      {
        key: "profile",
        label: "Profile",
        icon: "person-outline",
        href: "/retailer/profile",
        screen: "profile",
        kind: "tab",
      },
    ],
    drawer: [
      ...sharedDrawerItems("retailer"),
      {
        key: "cart",
        label: "Cart",
        icon: "cart-outline",
        href: "/retailer/cart",
        screen: "cart",
        kind: "drawer",
      },
      {
        key: "compare",
        label: "Compare Suppliers",
        icon: "git-compare-outline",
        href: "/retailer/compare",
        screen: "compare",
        kind: "drawer",
      },
    ],
    hiddenScreens: ["notifications", "messages", "support", "settings", "cart", "compare", "tracking"],
  },
  factory: {
    tabs: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: "grid-outline",
        href: "/factory/dashboard",
        screen: "dashboard",
        kind: "tab",
      },
      {
        key: "products",
        label: "Products",
        icon: "cube-outline",
        href: "/factory/products",
        screen: "products",
        kind: "tab",
      },
      {
        key: "orders",
        label: "Orders",
        icon: "receipt-outline",
        href: "/factory/orders",
        screen: "orders",
        kind: "tab",
      },
      {
        key: "agents",
        label: "Agents",
        icon: "people-outline",
        href: "/factory/agents",
        screen: "agents",
        kind: "tab",
      },
      {
        key: "profile",
        label: "Profile",
        icon: "person-outline",
        href: "/factory/profile",
        screen: "profile",
        kind: "tab",
      },
    ],
    drawer: [
      ...sharedDrawerItems("factory"),
      {
        key: "forecast",
        label: "Forecast",
        icon: "analytics-outline",
        href: "/factory/forecast",
        screen: "forecast",
        kind: "drawer",
      },
      {
        key: "delivery",
        label: "Delivery",
        icon: "car-outline",
        href: "/factory/delivery",
        screen: "delivery",
        kind: "drawer",
      },
      {
        key: "announcements",
        label: "Announcements",
        icon: "megaphone-outline",
        href: "/factory/announcements",
        screen: "announcements",
        kind: "drawer",
      },
    ],
    hiddenScreens: [
      "notifications",
      "messages",
      "support",
      "settings",
      "forecast",
      "delivery",
      "announcements",
    ],
  },
  distributor: {
    tabs: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: "grid-outline",
        href: "/distributor/dashboard",
        screen: "dashboard",
        kind: "tab",
      },
      {
        key: "products",
        label: "Products",
        icon: "cube-outline",
        href: "/distributor/products",
        screen: "products",
        kind: "tab",
      },
      {
        key: "orders",
        label: "Orders",
        icon: "receipt-outline",
        href: "/distributor/orders",
        screen: "orders",
        kind: "tab",
      },
      {
        key: "marketplace",
        label: "Purchase",
        icon: "storefront-outline",
        href: "/distributor/marketplace",
        screen: "marketplace",
        kind: "tab",
      },
      {
        key: "profile",
        label: "Profile",
        icon: "person-outline",
        href: "/distributor/profile",
        screen: "profile",
        kind: "tab",
      },
    ],
    drawer: [
      ...sharedDrawerItems("distributor"),
      {
        key: "delivery",
        label: "Delivery",
        icon: "car-outline",
        href: "/distributor/delivery",
        screen: "delivery",
        kind: "drawer",
      },
      {
        key: "promotions",
        label: "Promotions",
        icon: "megaphone-outline",
        href: "/distributor/promotions",
        screen: "promotions",
        kind: "drawer",
      },
      {
        key: "purchase-orders",
        label: "Purchase Orders",
        icon: "document-text-outline",
        href: "/distributor/purchase-orders",
        screen: "purchase-orders",
        kind: "drawer",
      },
    ],
    hiddenScreens: [
      "notifications",
      "messages",
      "support",
      "settings",
      "delivery",
      "promotions",
      "purchase-orders",
    ],
  },
  driver: {
    tabs: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: "grid-outline",
        href: "/driver/dashboard",
        screen: "dashboard",
        kind: "tab",
      },
      {
        key: "deliveries",
        label: "Deliveries",
        icon: "car-outline",
        href: "/driver/deliveries",
        screen: "deliveries",
        kind: "tab",
      },
      {
        key: "tracking",
        label: "Tracking",
        icon: "navigate-outline",
        href: "/driver/tracking",
        screen: "tracking",
        kind: "tab",
      },
      {
        key: "issues",
        label: "Issues",
        icon: "alert-circle-outline",
        href: "/driver/issues",
        screen: "issues",
        kind: "tab",
      },
      {
        key: "profile",
        label: "Profile",
        icon: "person-outline",
        href: "/driver/profile",
        screen: "profile",
        kind: "tab",
      },
    ],
    drawer: [
      ...sharedDrawerItems("driver"),
      {
        key: "history",
        label: "History",
        icon: "time-outline",
        href: "/driver/history",
        screen: "history",
        kind: "drawer",
      },
      {
        key: "active",
        label: "Active Route",
        icon: "location-outline",
        href: "/driver/active",
        screen: "active",
        kind: "drawer",
      },
    ],
    hiddenScreens: ["notifications", "messages", "support", "settings", "history", "active"],
  },
  admin: {
    tabs: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: "grid-outline",
        href: "/admin/dashboard",
        screen: "dashboard",
        kind: "tab",
      },
      {
        key: "users",
        label: "Users",
        icon: "people-outline",
        href: "/admin/users",
        screen: "users",
        kind: "tab",
      },
      {
        key: "products",
        label: "Products",
        icon: "cube-outline",
        href: "/admin/products",
        screen: "products",
        kind: "tab",
      },
      {
        key: "profile",
        label: "Profile",
        icon: "person-outline",
        href: "/admin/profile",
        screen: "profile",
        kind: "tab",
      },
    ],
    drawer: sharedDrawerItems("admin"),
    hiddenScreens: ["notifications", "messages", "support", "settings"],
  },
};
