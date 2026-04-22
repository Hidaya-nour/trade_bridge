export const DRIVER_ISSUE_CATEGORY_OPTIONS = [
  { value: "vehicle_issue", label: "Vehicle Issue" },
  { value: "product_issue", label: "Product Issue" },
  { value: "delivery_issue", label: "Delivery Issue" },
  { value: "route_navigation_issue", label: "Route/Navigation Issue" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "customer_issue", label: "Customer Issue" },
  { value: "safety_issue", label: "Safety Issue" },
  { value: "app_system_issue", label: "App/System Issue" },
  { value: "other", label: "Other" },
] as const;

export const DRIVER_ISSUE_SUBTYPE_OPTIONS: Record<string, string[]> = {
  vehicle_issue: [
    "Engine problem",
    "Tire damage",
    "Fuel shortage",
    "Brake failure",
    "Accident",
  ],
  product_issue: [
    "Product damage",
    "Lost item",
    "Wrong item",
    "Missing quantity",
    "Packaging issue",
  ],
  delivery_issue: [
    "Delayed delivery",
    "Unable to reach customer",
    "Wrong address",
    "Delivery refused",
  ],
  route_navigation_issue: ["GPS error", "Road blocked", "Traffic issue"],
  payment_issue: [
    "Payment not received",
    "Incorrect payment",
    "Digital payment failure",
  ],
  customer_issue: [
    "Customer unavailable",
    "Customer dispute",
    "Incorrect contact info",
  ],
  safety_issue: ["Theft attempt", "Harassment", "Unsafe environment"],
  app_system_issue: ["App crash", "Loading issue", "Incorrect data shown"],
  other: [],
};

export const DRIVER_ISSUE_URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

export const DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS = [
  { value: "distributor", label: "Distributor" },
  { value: "retailer", label: "Retailer" },
  { value: "factory", label: "Factory" },
  { value: "customer", label: "Customer" },
  { value: "platform_system", label: "Platform/System" },
  { value: "other", label: "Other" },
] as const;

export type DriverIssueCategoryValue =
  (typeof DRIVER_ISSUE_CATEGORY_OPTIONS)[number]["value"];
export type DriverIssueUrgencyValue =
  (typeof DRIVER_ISSUE_URGENCY_OPTIONS)[number]["value"];
export type DriverIssueConcernedPartyValue =
  (typeof DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS)[number]["value"];

export const DRIVER_ISSUE_CATEGORY_LABELS = Object.fromEntries(
  DRIVER_ISSUE_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DriverIssueCategoryValue, string>;

export const DRIVER_ISSUE_URGENCY_LABELS = Object.fromEntries(
  DRIVER_ISSUE_URGENCY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DriverIssueUrgencyValue, string>;

export const DRIVER_ISSUE_CONCERNED_PARTY_LABELS = Object.fromEntries(
  DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DriverIssueConcernedPartyValue, string>;
