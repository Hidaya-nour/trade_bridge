import { type UserRole } from "../types/auth.types";

export const roleNavigation: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  retailer: "/retailer/dashboard",
  distributor: "/distributor/dashboard",
  factory: "/factory/dashboard",
  driver: "/driver/dashboard",
};
