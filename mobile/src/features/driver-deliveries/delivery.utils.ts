import { type DeliveryPriority, type DeliveryStatus, type DriverDelivery } from "./delivery.types";

const formatShortDateTime = (value?: string | null) => {
  if (!value) {
    return "Pending";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const toOrderCode = (orderId?: string | null) => {
  if (!orderId) {
    return "ORDER";
  }

  return `ORD-${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
};

const inferPriority = (
  totalUnits: number,
  items: Array<{ name: string; unit: string }>,
): DeliveryPriority => {
  const joinedText = items
    .map((item) => `${item.name} ${item.unit}`)
    .join(" ")
    .toLowerCase();

  if (
    joinedText.includes("glass") ||
    joinedText.includes("bottle") ||
    joinedText.includes("beverage") ||
    joinedText.includes("milk")
  ) {
    return "fragile";
  }

  if (totalUnits >= 40) {
    return "urgent";
  }

  return "standard";
};

const inferProgress = (status: DeliveryStatus) => {
  switch (status) {
    case "pending":
      return 0;
    case "assigned":
      return 20;
    case "picked_up":
      return 45;
    case "in_transit":
      return 75;
    case "delivered":
      return 100;
    case "failed":
    case "cancelled":
      return 0;
  }
};

const inferEtaMinutes = (status: DeliveryStatus) => {
  switch (status) {
    case "pending":
      return 0;
    case "assigned":
      return 45;
    case "picked_up":
      return 28;
    case "in_transit":
      return 15;
    case "delivered":
    case "failed":
    case "cancelled":
      return 0;
  }
};

const buildTimeline = (delivery: any) => {
  const assignedTime = formatShortDateTime(delivery?.created_at);
  const pickupTime = formatShortDateTime(delivery?.started_at);
  const deliveredTime = formatShortDateTime(delivery?.completed_at);
  const status = (delivery?.status || "pending") as DeliveryStatus;

  return [
    {
      label: "Assignment confirmed",
      time: assignedTime,
      complete: true,
    },
    {
      label: "Pickup completed",
      time:
        delivery?.started_at
          ? pickupTime
          : status === "pending" || status === "assigned"
            ? "Pending pickup"
            : assignedTime,
      complete: ["picked_up", "in_transit", "delivered"].includes(status),
    },
    {
      label: "In transit",
      time:
        status === "in_transit" || status === "delivered"
          ? formatShortDateTime(delivery?.updated_at)
          : "Pending transit",
      complete: ["in_transit", "delivered"].includes(status),
    },
    {
      label:
        status === "cancelled"
          ? "Cancelled"
          : status === "failed"
            ? "Delivery failed"
            : "Delivered",
      time:
        delivery?.completed_at
          ? deliveredTime
          : status === "cancelled" || status === "failed"
            ? formatShortDateTime(delivery?.updated_at)
            : "Pending handoff",
      complete: ["delivered", "cancelled", "failed"].includes(status),
    },
  ];
};

export const mapApiDeliveryToDriverDelivery = (delivery: any): DriverDelivery => {
  const items = Array.isArray(delivery?.order?.items)
    ? delivery.order.items.map((item: any) => ({
        name: item?.product?.name || "Item",
        quantity: Number(item?.quantity || 0),
        unit: item?.product?.unit_type || "unit",
      }))
    : [];
  const totalUnits = items.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  );
  const status = (delivery?.status || "pending") as DeliveryStatus;

  return {
    id: String(delivery?.id || ""),
    orderId: String(delivery?.order?.id || delivery?.order_id || ""),
    orderCode: toOrderCode(delivery?.order?.id || delivery?.order_id),
    supplierName:
      delivery?.order?.supplier?.business_name ||
      delivery?.order?.supplier?.full_name ||
      "Supplier",
    buyerName:
      delivery?.order?.buyer?.business_name ||
      delivery?.order?.buyer?.full_name ||
      "Buyer",
    destination: delivery?.dropoff_location || "Dropoff not provided",
    pickupPoint: delivery?.pickup_location || "Pickup not provided",
    etaMinutes: inferEtaMinutes(status),
    routeProgress: inferProgress(status),
    status,
    products: items,
    contactPerson:
      delivery?.order?.buyer?.full_name ||
      delivery?.order?.buyer?.business_name ||
      "Buyer contact",
    contactPhone: delivery?.order?.buyer?.phone || "No phone available",
    vehiclePlate: delivery?.driver?.license_plate || "Pending vehicle assignment",
    priority: inferPriority(totalUnits, items),
    distanceKm: 0,
    scheduledWindow: `Assigned ${formatShortDateTime(delivery?.created_at)}`,
    notes: delivery?.notes || "No delivery note has been added yet.",
    deliveredAt: delivery?.completed_at
      ? formatShortDateTime(delivery.completed_at)
      : undefined,
    issueReported: status === "failed",
    timeline: buildTimeline(delivery),
  };
};
