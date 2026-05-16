import React from "react";
import { useLocation } from "react-router-dom";

import { useOrderStore } from "@/stores/order.store";
import { useDeliveryStore } from "@/stores/delivery.store";

const POLL_INTERVAL_MS = 5000;

const extractOrderIdFromPath = (pathname: string): string | null => {
  const patterns = [/\/orders\/([^/]+)/i, /\/purchase-orders\/([^/]+)/i, /\/tracking\/([^/]+)/i];

  for (const pattern of patterns) {
    const match = pathname.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const extractDeliveryIdFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/delivery\/([^/]+)/i);
  return match?.[1] || null;
};

export const RealtimeStatusSync: React.FC = () => {
  const { pathname } = useLocation();

  const refreshOrders = useOrderStore((s) => s.refreshLastOrdersSilent);
  const refreshOrderById = useOrderStore((s) => s.refreshOrderByIdSilent);
  const refreshDeliveries = useDeliveryStore((s) => s.refreshLastSilent);
  const refreshDeliveryById = useDeliveryStore((s) => s.refreshByIdSilent);

  React.useEffect(() => {
    const orderId = extractOrderIdFromPath(pathname);
    const deliveryId = extractDeliveryIdFromPath(pathname);

    const tick = async () => {
      await refreshOrders();
      if (orderId) await refreshOrderById(orderId);

      await refreshDeliveries();
      if (deliveryId) await refreshDeliveryById(deliveryId);
    };

    void tick();
    const interval = window.setInterval(() => void tick(), POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    pathname,
    refreshDeliveries,
    refreshDeliveryById,
    refreshOrderById,
    refreshOrders,
  ]);

  return null;
};
