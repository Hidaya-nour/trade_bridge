import React from "react";
import { RefreshCw, Save, Truck } from "lucide-react";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DriverService, { type DriverLink } from "@/services/driver.service";
import { useAuthStore } from "@/stores/auth.store";

const statusBadgeClass: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
  rejected: "bg-gray-100 text-gray-700 border-gray-200",
};

const VehicleTab: React.FC = () => {
  const { user } = useAuthStore();

  const [links, setLinks] = React.useState<DriverLink[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [vehicleType, setVehicleType] = React.useState("");
  const [licensePlate, setLicensePlate] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await DriverService.getMyVehicleLinks();
      const rows = Array.isArray(data?.drivers) ? data.drivers : [];
      setLinks(rows);

      const nextSelected = rows[0]?.id || "";
      setSelectedId(nextSelected);
      setVehicleType(rows[0]?.vehicle_type || "");
      setLicensePlate(rows[0]?.license_plate || "");
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || err?.message || "Failed to load vehicle info",
      );
      setLinks([]);
      setSelectedId("");
      setVehicleType("");
      setLicensePlate("");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user?.role !== "driver") return;
    void load();
  }, [load, user?.role]);

  React.useEffect(() => {
    const selected = links.find((l) => l.id === selectedId);
    if (!selected) return;
    setVehicleType(selected.vehicle_type || "");
    setLicensePlate(selected.license_plate || "");
  }, [links, selectedId]);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await DriverService.updateMyVehicleLink(selectedId, {
        vehicle_type: vehicleType.trim() || null,
        license_plate: licensePlate.trim() || null,
      });

      setLinks((prev) =>
        prev.map((row) => {
          if (row.id !== selectedId) return row;
          return {
            ...row,
            ...updated,
            supplier: updated.supplier ?? row.supplier,
          };
        }),
      );
      setMessage("Vehicle info updated successfully");
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || err?.message || "Failed to update vehicle info",
      );
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "driver") return null;

  const selected = links.find((l) => l.id === selectedId);
  const supplierName =
    selected?.supplier?.business_name ||
    selected?.supplier?.full_name ||
    "Supplier";

  return (
    <TabsContent value="business" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
          <CardDescription>
            View and update your vehicle details used for deliveries.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : links.length === 0 ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                No vehicle record found for your account. Ask your supplier to link
                you as a driver, then come back here to manage your vehicle info.
              </div>
              <Button
                variant="outline"
                onClick={() => void load()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    Linked supplier: <span className="font-semibold">{supplierName}</span>
                  </div>
                  {selected?.supplier?.status ? (
                    <div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          statusBadgeClass[String(selected.supplier.status)] || "",
                        )}
                      >
                        {String(selected.supplier.status)}
                      </Badge>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {links.length > 1 ? (
                    <Select value={selectedId} onValueChange={setSelectedId}>
                      <SelectTrigger className="w-[260px]">
                        <SelectValue placeholder="Select supplier link" />
                      </SelectTrigger>
                      <SelectContent>
                        {links.map((row) => {
                          const name =
                            row.supplier?.business_name ||
                            row.supplier?.full_name ||
                            row.supplier_id;
                          return (
                            <SelectItem key={row.id} value={row.id}>
                              {name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : null}

                  <Button
                    variant="outline"
                    onClick={() => void load()}
                    disabled={loading || saving}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle type</Label>
                  <Input
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. Truck, Van, Motorbike"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License plate</Label>
                  <Input
                    id="licensePlate"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="e.g. KAA 123A"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>

        {links.length > 0 ? (
          <CardFooter className="flex items-center justify-between gap-3 border-t pt-6">
            <div className="text-xs text-muted-foreground">
              Changes apply to the selected supplier link.
            </div>
            <Button onClick={() => void handleSave()} disabled={saving || loading || !selectedId} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        ) : null}

        {message ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">{message}</p>
        ) : null}
      </Card>
    </TabsContent>
  );
};

export default VehicleTab;

