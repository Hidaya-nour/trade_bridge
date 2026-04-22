import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, MapPin, Navigation, Package2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "./driver-issue.config";
import {
  mapApiDeliveryToDriverDelivery,
  type DriverDelivery,
} from "./driver-delivery.utils";

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
          `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`,
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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-4">
            <Badge className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
              Driver Support
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Report An Issue
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Capture delivery, vehicle, route, payment, and safety issues in a
                structured format so the operations team can act quickly.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Current context
            </p>
            {selectedDelivery ? (
              <div className="mt-4 space-y-3">
                <p className="text-2xl font-bold text-slate-950">
                  {selectedDelivery.orderCode}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedDelivery.supplierName} to {selectedDelivery.buyerName}
                </p>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Delivery destination
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {selectedDelivery.destination}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Submit a general issue, or connect the report to a specific
                delivery for faster follow-up.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="space-y-6 p-6">
            {isLoading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                <p className="mt-4 text-base font-semibold text-slate-900">
                  Loading issue tools
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Fetching your delivery context and recent reports.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryId">Related delivery</Label>
                    <Select
                      value={form.deliveryId || "general"}
                      onValueChange={(value) =>
                        updateField("deliveryId", value === "general" ? "" : value)
                      }
                    >
                      <SelectTrigger id="deliveryId" className="h-11 rounded-2xl">
                        <SelectValue placeholder="General issue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General issue</SelectItem>
                        {deliveries.map((delivery) => (
                          <SelectItem key={delivery.id} value={delivery.id}>
                            {delivery.orderCode} - {delivery.destination}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Issue category</Label>
                    <Select value={form.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger id="category" className="h-11 rounded-2xl">
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
                    {errors.category ? (
                      <p className="text-xs text-rose-600">{errors.category}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subType">
                      {selectedCategory === "other"
                        ? "Sub-issue detail"
                        : "Sub-issue type"}
                    </Label>
                    {selectedCategory === "other" ? (
                      <Input
                        id="subType"
                        value={form.subType}
                        onChange={(event) =>
                          updateField("subType", event.target.value)
                        }
                        placeholder="Describe the issue type"
                        className="h-11 rounded-2xl"
                      />
                    ) : (
                      <Select
                        value={form.subType}
                        onValueChange={(value) => updateField("subType", value)}
                        disabled={!selectedCategory}
                      >
                        <SelectTrigger id="subType" className="h-11 rounded-2xl">
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
                    {errors.subType ? (
                      <p className="text-xs text-rose-600">{errors.subType}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency level</Label>
                    <Select
                      value={form.urgency}
                      onValueChange={(value) => updateField("urgency", value)}
                    >
                      <SelectTrigger id="urgency" className="h-11 rounded-2xl">
                        <SelectValue placeholder="Choose urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVER_ISSUE_URGENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.urgency ? (
                      <p className="text-xs text-rose-600">{errors.urgency}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location of issue</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(event) => updateField("location", event.target.value)}
                      placeholder="Warehouse gate, roadside checkpoint, customer shop..."
                      className="h-11 rounded-2xl"
                    />
                    {errors.location ? (
                      <p className="text-xs text-rose-600">{errors.location}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-0">Location helper</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fillCurrentLocation}
                      disabled={locationLoading}
                      className="h-11 rounded-2xl border-slate-200"
                    >
                      {locationLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="mr-2 h-4 w-4" />
                      )}
                      Use current location
                    </Button>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="concernedParty">Concerned party</Label>
                    <Select
                      value={form.concernedParty || "none"}
                      onValueChange={(value) =>
                        updateField("concernedParty", value === "none" ? "" : value)
                      }
                    >
                      <SelectTrigger
                        id="concernedParty"
                        className="h-11 rounded-2xl"
                      >
                        <SelectValue placeholder="Select a party" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Add details that dispatch, support, or your supplier should know."
                    className="min-h-[140px] rounded-3xl"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-11 rounded-2xl bg-sky-600 hover:bg-sky-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4" />
                    )}
                    Submit report
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
                    className="h-11 rounded-2xl border-slate-200"
                  >
                    Reset fields
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Recent reports
              </p>
              <h2 className="text-xl font-semibold text-slate-950">
                Latest issue submissions
              </h2>
            </div>

            {reports.length ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full bg-white text-slate-700">
                        {DRIVER_ISSUE_CATEGORY_LABELS[report.category]}
                      </Badge>
                      <Badge className="rounded-full bg-rose-50 text-rose-700">
                        {DRIVER_ISSUE_URGENCY_LABELS[report.urgency]}
                      </Badge>
                    </div>
                    <p className="mt-3 font-semibold text-slate-950">
                      {report.sub_type}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{report.location}</p>
                    {report.concerned_party ? (
                      <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                        Concerned party:{" "}
                        {DRIVER_ISSUE_CONCERNED_PARTY_LABELS[report.concerned_party]}
                      </p>
                    ) : null}
                    {report.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {report.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                <Package2 className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 text-base font-semibold text-slate-900">
                  No issue reports yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Your latest submissions will appear here once you start
                  reporting incidents.
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4">
              <div className="flex items-start gap-3">
                <Navigation className="mt-0.5 h-5 w-5 text-sky-700" />
                <div>
                  <p className="font-medium text-slate-950">Location tip</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Use a precise landmark, coordinates, or customer stop so the
                    operations team can act quickly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverIssuesPage;
