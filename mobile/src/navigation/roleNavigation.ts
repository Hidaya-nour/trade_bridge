import { type UserRole } from "../types/auth.types";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
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
    { label: "Products", href: "/retailer/products", icon: "storefront-outline" },
    { label: "Suppliers", href: "/retailer/suppliers", icon: "business-outline" },
    { label: "Orders", href: "/retailer/orders", icon: "receipt-outline" },
    { label: "Cart", href: "/retailer/cart", icon: "cart-outline" },
    { label: "Compare", href: "/retailer/compare", icon: "git-compare-outline" },
  ],
  distributor: [
    { label: "Dashboard", href: "/distributor/dashboard", icon: "grid-outline" },
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