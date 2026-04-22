import type { UserRole } from "@/features/auth/auth.types";

const validRoles: UserRole[] = ["admin", "retailer", "distributor", "factory", "driver"];

export const isUserRole = (value: string): value is UserRole =>
  validRoles.includes(value as UserRole);
