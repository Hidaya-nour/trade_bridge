import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  MapPin,
  Navigation,
  Package2,
  Phone,
  Search,
  Truck,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import {
  DRIVER_DELIVERIES,
  type DeliveryPriority,
  type DeliveryStatus,
  type DriverDelivery,
} from "./driverData";

type DeliveryTab = "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";

const deliveryTabs: DeliveryTab[] = [
  "pending",
  "assigned",
  "in_transit",
  "delivered",
  "cancelled",
];

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const statusColorMap: Record<DeliveryStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  assigned: "border-blue-200 bg-blue-50 text-blue-700",
  picked_up: "border-violet-200 bg-violet-50 text-violet-700",
  in_transit: "border-orange-200 bg-orange-50 text-orange-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const priorityColorMap: Record<DeliveryPriority, string> = {
  standard: "bg-slate-100 text-slate-700",
  urgent: "bg-rose-100 text-rose-700",
  fragile: "bg-orange-100 text-orange-700",
};

const matchesTab = (delivery: DriverDelivery, tab: DeliveryTab) => {
  if (tab === "assigned") {
    return delivery.status === "assigned" || delivery.status === "picked_up";
  }

  return delivery.status === tab;
};

const getLoadTotal = (delivery: DriverDelivery) =>
  delivery.products.reduce((total, product) => total + product.quantity, 0);

export const ActiveDeliveriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DeliveryTab>("pending");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

  const filteredDeliveries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return DRIVER_DELIVERIES.filter((delivery) => {
      const matchesSearch =
        !query ||
        [
          delivery.orderCode,
          delivery.supplierName,
          delivery.buyerName,
          delivery.destination,
          delivery.pickupPoint,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesSearch && matchesTab(delivery, activeTab);
    });
  }, [activeTab, searchQuery]);

  const selectedDelivery = useMemo(
    () =>
      filteredDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ??
      filteredDeliveries[0] ??
      null,
    [filteredDeliveries, selectedDeliveryId],
  );

  useEffect(() => {
    setSelectedDeliveryId(filteredDeliveries[0]?.id ?? null);
  }, [activeTab, searchQuery]);

  const tabCounts = useMemo(
    () =>
      deliveryTabs.reduce(
        (counts, tab) => {
          counts[tab] = DRIVER_DELIVERIES.filter((delivery) =>
            matchesTab(delivery, tab),
          ).length;
          return counts;
        },
        {} as Record<DeliveryTab, number>,
      ),
    [],
  );

  const nextDelivery =
    DRIVER_DELIVERIES.find(
      (delivery) =>
        delivery.status !== "delivered" && delivery.status !== "cancelled",
    ) ?? null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/90">
                Driver Workspace
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Review assignments by status, search across stops, and keep the
                current delivery details visible while you work.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {deliveryTabs.map((tab) => (
                <div
                  key={tab}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
                >
                  <p className="text-2xl font-bold">{tabCounts[tab]}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">
                    {tab.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              Next Priority Stop
            </p>
            {nextDelivery ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-2xl font-bold">{nextDelivery.orderCode}</p>
                  <p className="mt-1 text-sm text-slate-200">
                    {nextDelivery.destination}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-300">
                      ETA
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {nextDelivery.etaMinutes} min
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-300">
                      Route Progress
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {nextDelivery.routeProgress}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-200">
                  {nextDelivery.supplierName} to {nextDelivery.buyerName}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-200">
                No active route is waiting right now.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by order, customer, supplier, or destination"
              className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-9"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as DeliveryTab)}
            className="w-full xl:w-auto"
          >
            <TabsList className="h-auto w-full flex-wrap gap-2 rounded-2xl bg-slate-100 p-1 xl:w-auto">
              {deliveryTabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="h-10 min-w-[120px] rounded-xl px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
                >
                  <span>{formatStatus(tab)}</span>
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs",
                      activeTab === tab
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-500",
                    )}
                  >
                    {tabCounts[tab]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {formatStatus(activeTab)} Deliveries
                </h2>
                <p className="text-sm text-slate-500">
                  {filteredDeliveries.length} delivery
                  {filteredDeliveries.length === 1 ? "" : "ies"} in this tab
                </p>
              </div>
            </div>

            {filteredDeliveries.length ? (
              <div className="space-y-3">
                {filteredDeliveries.map((delivery) => {
                  const loadTotal = getLoadTotal(delivery);

                  return (
                    <button
                      key={delivery.id}
                      type="button"
                      onClick={() => setSelectedDeliveryId(delivery.id)}
                      className={cn(
                        "w-full rounded-3xl border p-5 text-left transition-all",
                        selectedDelivery?.id === delivery.id
                          ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                      )}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold">
                              {delivery.orderCode}
                            </p>
                            <Badge
                              className={cn(
                                "border",
                                selectedDelivery?.id === delivery.id
                                  ? "border-white/20 bg-white/10 text-white"
                                  : statusColorMap[delivery.status],
                              )}
                            >
                              {formatStatus(delivery.status)}
                            </Badge>
                            <Badge
                              className={cn(
                                "border-0",
                                selectedDelivery?.id === delivery.id
                                  ? "bg-white/10 text-white"
                                  : priorityColorMap[delivery.priority],
                              )}
                            >
                              {delivery.priority.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-black/5 bg-black/[0.03] p-3 text-sm">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Route
                              </p>
                              <p className="mt-1 font-medium text-inherit">
                                {delivery.supplierName} to {delivery.buyerName}
                              </p>
                              <p className="mt-2 text-sm text-slate-500">
                                {delivery.destination}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-black/5 bg-black/[0.03] p-3 text-sm">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Window
                              </p>
                              <p className="mt-1 font-medium text-inherit">
                                {delivery.scheduledWindow}
                              </p>
                              <p className="mt-2 text-sm text-slate-500">
                                {delivery.status === "delivered"
                                  ? delivery.deliveredAt
                                  : `${delivery.etaMinutes} min ETA`}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Load
                              </p>
                              <p className="mt-1 font-semibold text-inherit">
                                {loadTotal} units
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Distance
                              </p>
                              <p className="mt-1 font-semibold text-inherit">
                                {delivery.distanceKm} km
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Progress
                              </p>
                              <p className="mt-1 font-semibold text-inherit">
                                {delivery.routeProgress}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span>Open details</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <Card className="rounded-3xl border-dashed shadow-none">
                <CardContent className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
                  <Package2 className="h-10 w-10 text-slate-300" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No {formatStatus(activeTab).toLowerCase()} deliveries
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Deliveries with this status will appear here after they are
                    assigned or updated.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-0">
                {selectedDelivery ? (
                  <div className="space-y-0">
                    <div className="border-b border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Delivery Details
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-slate-950">
                            {selectedDelivery.orderCode}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {selectedDelivery.supplierName} to{" "}
                            {selectedDelivery.buyerName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={cn("border", statusColorMap[selectedDelivery.status])}>
                            {formatStatus(selectedDelivery.status)}
                          </Badge>
                          <Badge className={priorityColorMap[selectedDelivery.priority]}>
                            {selectedDelivery.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 border-b border-slate-200 p-5 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {selectedDelivery.status === "delivered" ? "Delivered" : "ETA"}
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          {selectedDelivery.status === "delivered"
                            ? selectedDelivery.deliveredAt
                            : `${selectedDelivery.etaMinutes} min`}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Distance
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          {selectedDelivery.distanceKm} km
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Load
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          {getLoadTotal(selectedDelivery)} units
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            Route progress
                          </span>
                          <span className="text-slate-500">
                            {selectedDelivery.routeProgress}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-sky-500"
                            style={{ width: `${selectedDelivery.routeProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <MapPin className="h-4 w-4 text-sky-600" />
                            Route Information
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Pickup
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {selectedDelivery.pickupPoint}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Dropoff
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {selectedDelivery.destination}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Delivery window
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {selectedDelivery.scheduledWindow}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                Vehicle
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {selectedDelivery.vehiclePlate || "Pending vehicle assignment"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <UserRound className="h-4 w-4 text-sky-600" />
                            Recipient Details
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                              <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Contact person
                                </p>
                                <p className="mt-1 font-medium text-slate-900">
                                  {selectedDelivery.contactPerson}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Phone
                                </p>
                                <p className="mt-1 font-medium text-slate-900">
                                  {selectedDelivery.contactPhone}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-xs uppercase tracking-wide text-sky-700">
                                Driver note
                              </p>
                              <p className="mt-2 leading-6 text-slate-700">
                                {selectedDelivery.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Package2 className="h-4 w-4 text-sky-600" />
                          Load Details
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedDelivery.products.map((product) => (
                            <div
                              key={`${selectedDelivery.id}-${product.name}`}
                              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                            >
                              <div>
                                <p className="font-medium text-slate-900">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {product.quantity} {product.unit}
                                </p>
                              </div>
                              <Package2 className="h-5 w-5 text-sky-600" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <CalendarClock className="h-4 w-4 text-sky-600" />
                          Delivery Timeline
                        </div>
                        <div className="mt-4 space-y-4">
                          {selectedDelivery.timeline.map((item) => (
                            <div
                              key={`${selectedDelivery.id}-${item.label}`}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={cn(
                                  "mt-1 h-3 w-3 rounded-full",
                                  item.complete ? "bg-emerald-500" : "bg-slate-300",
                                )}
                              />
                              <div>
                                <p className="font-medium text-slate-900">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        {selectedDelivery.status !== "delivered" && (
                          <Button asChild className="h-11 rounded-2xl bg-sky-600 hover:bg-sky-700">
                            <Link to="/driver/tracking">
                              <Navigation className="mr-2 h-4 w-4" />
                              Open live tracking
                            </Link>
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="outline"
                          className="h-11 rounded-2xl border-slate-200"
                        >
                          <Link to="/driver/issues">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {selectedDelivery.issueReported ? "View issue log" : "Report issue"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[500px] flex-col items-center justify-center px-6 py-12 text-center">
                    <Truck className="h-10 w-10 text-slate-300" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      Pick a delivery
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Choose any delivery card from the list to keep its details
                      visible here while you work through the tab.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ActiveDeliveriesPage;
