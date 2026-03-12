import { type UserRole } from "../types/auth.types";

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

// Backward-compatible export used in existing code.
export const roleNavigation = roleDefaultRoute;

export const roleSidebarNavigation: Record<UserRole, SidebarNavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "grid-outline" },
    { label: "Users", href: "/admin/users", icon: "people-outline" },
    { label: "Products", href: "/admin/products", icon: "cube-outline" },
  ],
  retailer: [
    { label: "Dashboard", href: "/retailer/dashboard", icon: "grid-outline" },
    { label: "Browse Products", href: "/retailer/products", icon: "storefront-outline" },
    { label: "Browse Suppliers", href: "/retailer/suppliers", icon: "trending-up-outline" },
    { label: "My Orders", href: "/retailer/orders", icon: "cube-outline" },
    { label: "Shopping Cart", href: "/retailer/cart", icon: "cart-outline" },
    { label: "Analytics", href: "/retailer/analytics", icon: "bar-chart-outline" },
  ],
  distributor: [
    // Main
    { section: "Main Menu", label: "Dashboard", href: "/distributor/dashboard", icon: "grid-outline" },
    { section: "Main Menu", label: "Manage Products", href: "/distributor/products", icon: "cube-outline" },
    { section: "Main Menu", label: "Inventory", href: "/distributor/inventory", icon: "home-outline" },

    // Retail Operations
    { section: "Retail Operations", label: "Retailer Orders", href: "/distributor/orders", icon: "cart-outline" },
    { section: "Retail Operations", label: "Delivery Management", href: "/distributor/delivery", icon: "car-outline" },
    { section: "Retail Operations", label: "Broadcast Promotions", href: "/distributor/promotions", icon: "trending-up-outline" },

    // Purchasing
    { section: "Purchasing", label: "Purchase Products", href: "/distributor/browse-products", icon: "business-outline" },
    { section: "Purchasing", label: "Purchase Cart", href: "/distributor/cart", icon: "cart-outline" },
    { section: "Purchasing", label: "Purchase Orders", href: "/distributor/purchase-orders", icon: "document-text-outline" },

    // Analytics
    { section: "Analytics", label: "Sales Analytics", href: "/distributor/analytics", icon: "bar-chart-outline" },
    { section: "Analytics", label: "Supplier Partnerships", href: "/distributor/partners", icon: "people-outline" },
  ],
  factory: [
    { label: "Dashboard", href: "/factory/dashboard", icon: "grid-outline" },
  ],
  driver: [
    { label: "Dashboard", href: "/driver/dashboard", icon: "grid-outline" },
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
    if (segment === "tracking") return "Tracking";
    if (segment === "users") return "Users";
  }

  return parts[parts.length - 1]
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};