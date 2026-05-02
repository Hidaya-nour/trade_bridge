import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, MapPin, Navigation, Package2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import deliveryService from "@/services/delivery.service";
import driverIssueService from "@/services/driver-issue.service";
import {
  DRIVER_ISSUE_CATEGORY_LABELS,
  DRIVER_ISSUE_CATEGORY_OPTIONS,
  DRIVER_ISSUE_CONCERNED_PARTY_LABELS,
  DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS,
  DRIVER_ISSUE_SUBTYPE_OPTIONS,
  DRIVER_ISSUE_URGENCY_LABELS,
  DRIVER_ISSUE_URGENCY_OPTIONS,
  type DriverIssueCategoryValue,
  type DriverIssueConcernedPartyValue,
  type DriverIssueUrgencyValue,
} from "../../lib/driver-issue.config";
import {
  mapApiDeliveryToDriverDelivery,
  type DriverDelivery,
} from "../../lib/driver-delivery.utils";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type DriverIssueReport = {
  id: string;
  delivery_id?: string | null;
  category: DriverIssueCategoryValue;
  sub_type: string;
  location: string;
  urgency: DriverIssueUrgencyValue;
  description?: string | null;
  concerned_party?: DriverIssueConcernedPartyValue | null;
  created_at: string;
};

const emptyForm = {
  deliveryId: "",
  category: "",
  subType: "",
  location: "",
  urgency: "",
  description: "",
  concernedParty: "",
};

const urgencyColorMap: Record<DriverIssueUrgencyValue, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export const DriverIssuesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const deliveryIdFromQuery = searchParams.get("deliveryId") ?? "";
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [reports, setReports] = useState<DriverIssueReport[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);

      try {
        const [deliveryResponse, reportResponse] = await Promise.all([
          deliveryService.getMyDeliveries(),
          driverIssueService.getMyReports(8),
        ]);

        const deliveryRows: any[] = Array.isArray(deliveryResponse?.data?.deliveries)
          ? deliveryResponse.data.deliveries
          : [];
        const reportRows: DriverIssueReport[] = Array.isArray(
          reportResponse?.data?.reports,
        )
          ? reportResponse.data.reports
          : [];

        setDeliveries(deliveryRows.map(mapApiDeliveryToDriverDelivery));
        setReports(reportRows);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load the issue reporting workspace.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, []);

  useEffect(() => {
    if (deliveryIdFromQuery) {
      setForm((current) => ({ ...current, deliveryId: deliveryIdFromQuery }));
    }
  }, [deliveryIdFromQuery]);

  const selectedCategory = form.category as DriverIssueCategoryValue | "";
  const subTypeOptions = selectedCategory
    ? DRIVER_ISSUE_SUBTYPE_OPTIONS[selectedCategory]
    : [];

  const selectedDelivery = useMemo(
    () => deliveries.find((delivery) => delivery.id === form.deliveryId) ?? null,
    [deliveries, form.deliveryId],
  );

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleCategoryChange = (value: string) => {
    setForm((current) => ({
      ...current,
      category: value,
      subType: "",
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.category;
      delete next.subType;
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.category) nextErrors.category = "Choose an issue category.";
    if (!form.subType.trim()) nextErrors.subType = "Choose or enter a sub-type.";
    if (!form.location.trim()) nextErrors.location = "Enter where the issue happened.";
    if (!form.urgency) nextErrors.urgency = "Choose an urgency level.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not available in this browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateField(
          "location",
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        );
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        toast.error("Could not read your current location.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await driverIssueService.create({
        delivery_id: form.deliveryId || undefined,
        category: form.category,
        sub_type: form.subType.trim(),
        location: form.location.trim(),
        urgency: form.urgency,
        description: form.description.trim() || undefined,
        concerned_party: form.concernedParty || undefined,
      });

      const report = response?.data?.report as DriverIssueReport | undefined;
      if (report) {
        setReports((current) => [report, ...current].slice(0, 8));
      }

      toast.success("Issue report submitted.");
      setForm({
        ...emptyForm,
        deliveryId: form.deliveryId,
      });

      if (deliveryIdFromQuery) {
        setSearchParams({});
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to submit the issue report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    totalReports: reports.length,
    urgentReports: reports.filter(r => r.urgency === "high" || r.urgency === "critical").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Driver Support
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Capture delivery, vehicle, route, payment, and safety issues in a structured format
          so the operations team can act quickly.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Issues</p>
                <p className="text-2xl font-bold">{stats.urgentReports}</p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                stats.urgentReports > 0 ? "bg-red-100" : "bg-gray-100"
              )}>
                <AlertTriangle className={cn("h-5 w-5", stats.urgentReports > 0 ? "text-red-600" : "text-gray-600")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         {/* Right Column - Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your latest issue submissions
                </p>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border border-border p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-muted">
                            {DRIVER_ISSUE_CATEGORY_LABELS[report.category]}
                          </Badge>
                          <Badge className={urgencyColorMap[report.urgency]}>
                            {DRIVER_ISSUE_URGENCY_LABELS[report.urgency]}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(report.created_at)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{report.sub_type}</p>
                        <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{report.location}</span>
                        </div>
                        {report.concerned_party && (
                          <Badge variant="secondary" className="mt-2">
                            {DRIVER_ISSUE_CONCERNED_PARTY_LABELS[report.concerned_party]}
                          </Badge>
                        )}
                        {report.description && (
                          <p className="mt-2 text-sm text-muted-foreground border-l-2 border-border pl-3">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Package2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-base font-semibold">No issue reports yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your latest submissions will appear here once you start reporting incidents.
                </p>
              </div>
            )}

            <Separator className="my-4" />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Navigation className="mt-0.5 h-5 w-5 text-blue-700" />
                <div>
                  <p className="font-medium">Location Tip</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Use a precise landmark, coordinates, or customer stop so the
                    operations team can act quickly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Left Column - Issue Form */}
        <Card>
          <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-base font-semibold">Loading issue tools</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Fetching your delivery context and recent reports.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryId">Related Delivery</Label>
                    <Select
                      value={form.deliveryId || "general"}
                      onValueChange={(value) =>
                        updateField("deliveryId", value === "general" ? "" : value)
                      }
                    >
                      <SelectTrigger id="deliveryId">
                        <SelectValue placeholder="General issue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General issue (no delivery)</SelectItem>
                        {deliveries.map((delivery) => (
                          <SelectItem key={delivery.id} value={delivery.id}>
                            {delivery.orderCode} - {delivery.destination.slice(0, 40)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Issue Category</Label>
                    <Select value={form.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVER_ISSUE_CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-destructive">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subType">
                      {selectedCategory === "other" ? "Sub-issue Detail" : "Sub-issue Type"}
                    </Label>
                    {selectedCategory === "other" ? (
                      <Input
                        id="subType"
                        value={form.subType}
                        onChange={(event) =>
                          updateField("subType", event.target.value)
                        }
                        placeholder="Describe the issue type"
                      />
                    ) : (
                      <Select
                        value={form.subType}
                        onValueChange={(value) => updateField("subType", value)}
                        disabled={!selectedCategory}
                      >
                        <SelectTrigger id="subType">
                          <SelectValue placeholder="Select a sub-type" />
                        </SelectTrigger>
                        <SelectContent>
                          {subTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.subType && (
                      <p className="text-xs text-destructive">{errors.subType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={form.urgency}
                      onValueChange={(value) => updateField("urgency", value)}
                    >
                      <SelectTrigger id="urgency">
                        <SelectValue placeholder="Choose urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVER_ISSUE_URGENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "h-2 w-2 rounded-full",
                                option.value === "critical" && "bg-red-500",
                                option.value === "high" && "bg-orange-500",
                                option.value === "medium" && "bg-yellow-500",
                                option.value === "low" && "bg-blue-500",
                              )} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.urgency && (
                      <p className="text-xs text-destructive">{errors.urgency}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location of Issue</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(event) => updateField("location", event.target.value)}
                      placeholder="Warehouse gate, roadside checkpoint, customer shop, or coordinates..."
                    />
                    {errors.location && (
                      <p className="text-xs text-destructive">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-0">Location Helper</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fillCurrentLocation}
                      disabled={locationLoading}
                      className="w-full"
                    >
                      {locationLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="mr-2 h-4 w-4" />
                      )}
                      Use Current Location
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concernedParty">Concerned Party</Label>
                  <Select
                    value={form.concernedParty || "none"}
                    onValueChange={(value) =>
                      updateField("concernedParty", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger id="concernedParty">
                      <SelectValue placeholder="Select a party (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {DRIVER_ISSUE_CONCERNED_PARTY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Add details that dispatch, support, or your supplier should know."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4" />
                    )}
                    Submit Report
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm({
                        ...emptyForm,
                        deliveryId: form.deliveryId,
                      });
                      setErrors({});
                    }}
                    disabled={isSubmitting}
                  >
                    Reset Fields
                  </Button>
                </div>

                {/* Current Delivery Context */}
                {selectedDelivery && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-medium mb-2">Current Delivery Context</p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Order:</span>{" "}
                        {selectedDelivery.orderCode}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Route:</span>{" "}
                        {selectedDelivery.supplierName} → {selectedDelivery.buyerName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Destination:</span>{" "}
                        {selectedDelivery.destination}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

       
      </div>
    </div>
  );
};

export default DriverIssuesPage;