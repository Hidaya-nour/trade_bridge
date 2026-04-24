import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, RefreshCw, ShieldAlert, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

import { reportService } from "@/services/report.service";
import { authService } from "@/services/auth.service";
import { formatDate } from "@/lib/formatters";

type SummaryRow = {
  reported_user_id: string;
  total_reports: number;
  open_reports: number;
  last_reported_at?: string;
  open_appeal?: {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
  } | null;
  user?: {
    id: string;
    full_name?: string;
    email?: string;
    business_name?: string;
    role?: string;
    status?: string;
    verified?: boolean;
  } | null;
};

const UserReportsManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SummaryRow[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<SummaryRow | null>(null);
  const [selectedReports, setSelectedReports] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await reportService.getAdminSummary();
      const summary = response?.data?.summary || [];
      setItems(Array.isArray(summary) ? summary : []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load user reports",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const appealA = a.open_appeal ? 1 : 0;
      const appealB = b.open_appeal ? 1 : 0;
      if (appealB !== appealA) return appealB - appealA;
      return (b.open_reports || 0) - (a.open_reports || 0);
    });
  }, [items]);

  const openDetails = async (row: SummaryRow) => {
    setSelected(row);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await reportService.getAdminReportsForUser(
        row.reported_user_id,
        {
          page: 1,
          limit: 50,
        },
      );
      setSelectedReports(response?.data?.reports || []);
    } catch {
      setSelectedReports([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleSuspend = async (row: SummaryRow) => {
    const user = row.user;
    if (!user?.id) return;
    try {
      if (user.status === "suspended") {
        await authService.reactivateUser(user.id);
        toast.success("User reactivated");
      } else {
        await authService.suspendUser(user.id);
        toast.success("User suspended");
      }
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Reports</h1>
          <p className="text-muted-foreground mt-1">
            Review repeated reports and take action when needed.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Reported Users
          </CardTitle>
          <CardDescription>
            Sorted by open reports. Click “View” to inspect report history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="py-8 text-sm text-muted-foreground">Loading...</div>
          ) : sorted.length === 0 ? (
            <div className="py-8 text-sm text-muted-foreground">
              No user reports yet.
            </div>
          ) : (
            sorted.map((row) => {
              const user = row.user;
              const displayName =
                user?.business_name ||
                user?.full_name ||
                user?.email ||
                row.reported_user_id;
              const suspended = user?.status === "suspended";
              const appeal = row.open_appeal;

              return (
                <div
                  key={row.reported_user_id}
                  className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{displayName}</p>
                      {user?.role && (
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      )}
                      {suspended && (
                        <Badge className="bg-red-600">Suspended</Badge>
                      )}
                      {appeal ? (
                        <Badge className="bg-amber-500">Appeal</Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total: {row.total_reports} • Open: {row.open_reports}
                      {row.last_reported_at
                        ? ` • Last: ${formatDate(row.last_reported_at)}`
                        : ""}
                    </div>
                    {appeal?.message ? (
                      <div className="mt-2 rounded-lg border bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <div className="font-semibold">
                          Suspension appeal{" "}
                          {appeal.created_at
                            ? `(${formatDate(appeal.created_at)})`
                            : ""}
                        </div>
                        <div className="mt-1 whitespace-pre-wrap">
                          {appeal.message}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void openDetails(row)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {user?.id && (
                      <Button
                        variant={suspended ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => void toggleSuspend(row)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {suspended ? "Reactivate" : "Suspend"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              {selected?.user?.business_name ||
                selected?.user?.full_name ||
                selected?.user?.email ||
                selected?.reported_user_id ||
                ""}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {selected?.reported_user_id ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/admin/users?search=${selected.reported_user_id}`}>
                  View Profile
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link
                  to={`/admin/products?supplier_id=${selected.reported_user_id}`}
                >
                  View Products
                </Link>
              </Button>
            </div>
          ) : null}

          {selected?.open_appeal ? (
            <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">Open suspension appeal</p>
                  <p className="text-xs text-amber-800 mt-1">
                    {selected.open_appeal.created_at
                      ? formatDate(selected.open_appeal.created_at)
                      : ""}
                  </p>
                </div>
                {selected?.user?.status === "suspended" &&
                selected?.user?.id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void toggleSuspend(selected)}
                  >
                    Reactivate
                  </Button>
                ) : null}
              </div>
              {selected.open_appeal.message ? (
                <p className="mt-2 whitespace-pre-wrap text-amber-900">
                  {selected.open_appeal.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <ScrollArea className="max-h-[60vh] pr-4">
            {detailLoading ? (
              <div className="py-6 text-sm text-muted-foreground">
                Loading reports...
              </div>
            ) : selectedReports.length === 0 ? (
              <div className="py-6 text-sm text-muted-foreground">
                No reports found.
              </div>
            ) : (
              <div className="space-y-3 py-1">
                {selectedReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {report.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.created_at
                            ? formatDate(report.created_at)
                            : ""}
                          {report.reporter?.full_name
                            ? ` • by ${report.reporter.full_name}`
                            : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {String(report.status || "open")}
                      </Badge>
                    </div>
                    {report.description && (
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {report.description}
                      </p>
                    )}
                    {report.order_id && (
                      <p className="text-xs text-muted-foreground">
                        Order: {report.order_id}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserReportsManagementPage;
