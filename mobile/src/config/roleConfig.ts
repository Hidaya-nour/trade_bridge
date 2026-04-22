import type { UserRole } from "@/features/auth/auth.types";

export type ProfileFieldKey =
  | "full_name"
  | "email"
  | "phone"
  | "business_name"
  | "tin_number"
  | "verification";

export interface SupportTopic {
  id: string;
  title: string;
  description: string;
}

export interface RoleConfig {
  label: string;
  profileFields: ProfileFieldKey[];
  profileDescription: string;
  notificationsDescription: string;
  messagesDescription: string;
  supportDescription: string;
  supportTopics: SupportTopic[];
}

export const roleConfig: Record<UserRole, RoleConfig> = {
  admin: {
    label: "Admin",
    profileFields: ["full_name", "email", "phone", "verification"],
    profileDescription: "Keep your account details current for approvals, escalations, and internal coordination.",
    notificationsDescription: "Review platform alerts, escalations, and approval updates.",
    messagesDescription: "Coordinate with every workspace through one shared inbox.",
    supportDescription: "Find policy references, troubleshooting guides, and fast escalation channels.",
    supportTopics: [
      { id: "approvals", title: "Approvals & reviews", description: "Handle verification, disputes, and workflow escalations." },
      { id: "platform", title: "Platform issues", description: "Troubleshoot sync, notifications, and account access." },
      { id: "security", title: "Security support", description: "Get help with credentials, access control, and suspicious activity." },
    ],
  },
  retailer: {
    label: "Retailer",
    profileFields: ["full_name", "email", "phone", "business_name", "tin_number", "verification"],
    profileDescription: "Manage your account identity and storefront details for suppliers and support teams.",
    notificationsDescription: "Track orders, payments, supplier updates, and delivery changes.",
    messagesDescription: "Stay in touch with suppliers, distributors, drivers, and support.",
    supportDescription: "Get help with ordering, payments, refunds, and supplier coordination.",
    supportTopics: [
      { id: "orders", title: "Orders & payments", description: "Learn how checkout, proof of payment, and order status updates work." },
      { id: "suppliers", title: "Suppliers & products", description: "Find help comparing suppliers and resolving catalog issues." },
      { id: "delivery", title: "Delivery support", description: "Understand tracking, delays, and fulfillment questions." },
    ],
  },
  distributor: {
    label: "Distributor",
    profileFields: ["full_name", "email", "phone", "business_name", "tin_number", "verification"],
    profileDescription: "Maintain your contact and company details for purchasing, sales, and partner operations.",
    notificationsDescription: "Track retail operations, purchase orders, and logistics events.",
    messagesDescription: "Coordinate inventory, delivery, and order flow with every partner role.",
    supportDescription: "Get help with purchasing, distribution operations, and partner communications.",
    supportTopics: [
      { id: "inventory", title: "Inventory & catalog", description: "Resolve stock visibility, product management, and availability issues." },
      { id: "orders", title: "Order operations", description: "Handle retailer orders, purchase orders, and fulfillment questions." },
      { id: "delivery", title: "Delivery coordination", description: "Manage assignment issues, route delays, and partner updates." },
    ],
  },
  factory: {
    label: "Factory",
    profileFields: ["full_name", "email", "phone", "business_name", "tin_number", "verification"],
    profileDescription: "Keep production-facing account details accurate for partners, logistics, and support.",
    notificationsDescription: "Watch production, delivery, and partner order notifications.",
    messagesDescription: "Talk with distributors, retailers, admins, and operations contacts.",
    supportDescription: "Find guidance for product operations, shipping updates, and account administration.",
    supportTopics: [
      { id: "production", title: "Production operations", description: "Resolve product workflow, planning, and stock publishing issues." },
      { id: "partners", title: "Partner coordination", description: "Get support for distributor communication and order fulfillment." },
      { id: "delivery", title: "Shipping & logistics", description: "Review shipping updates, route blockers, and delivery exceptions." },
    ],
  },
  driver: {
    label: "Driver",
    profileFields: ["full_name", "email", "phone", "verification"],
    profileDescription: "Manage your delivery contact details so dispatch, support, and partners can reach you quickly.",
    notificationsDescription: "Track assignments, route changes, proof requests, and delivery alerts.",
    messagesDescription: "Coordinate directly with dispatchers, retailers, distributors, factories, and admins.",
    supportDescription: "Get quick help for active deliveries, route issues, and account questions.",
    supportTopics: [
      { id: "deliveries", title: "Active delivery help", description: "Get support for assignment issues, delays, and proof-of-delivery steps." },
      { id: "vehicle", title: "Route & vehicle issues", description: "Review policies for breakdowns, reroutes, and incident reporting." },
      { id: "account", title: "Driver account support", description: "Resolve access, notification, and communication problems." },
    ],
  },
};

export const allChatRoles: UserRole[] = [
  "admin",
  "retailer",
  "distributor",
  "factory",
  "driver",
];

export const getRoleRoute = (role: UserRole, leaf?: string) =>
  leaf ? `/${role}/${leaf}` : `/${role}`;
