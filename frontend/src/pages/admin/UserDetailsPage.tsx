import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
  RefreshCw,
  Save,
  Shield,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { authService, type AdminUpdateUserData } from "@/services/auth.service";
import { reportService } from "@/services/report.service";
import { formatDate } from "@/lib/formatters";
import { cn, getInitials } from "@/lib/utils";

type AdminUserRole =
  | "retailer"
  | "distributor"
  | "factory"
  | "driver"
  | "admin";
type AdminUserStatus = "pending" | "active" | "suspended";

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  phone?: string;
  business_name?: string;
  verified: boolean;
  created_at: string;
  last_login?: string;
};

const roleBadgeClass: Record<AdminUserRole, string> = {
  retailer: "bg-blue-100 text-blue-700 border-blue-200",
  distributor: "bg-purple-100 text-purple-700 border-purple-200",
  factory: "bg-green-100 text-green-700 border-green-200",
  driver: "bg-amber-100 text-amber-700 border-amber-200",
  admin: "bg-red-100 text-red-700 border-red-200",
};

const statusBadgeClass: Record<AdminUserStatus, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
};

export const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const editMode = searchParams.get("edit") === "1";

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reports">(
    "overview",
  );
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [form, setForm] = useState<AdminUpdateUserData>({
    full_name: "",
    phone: "",
    business_name: "",
    role: "retailer",
    status: "active",
    verified: false,
  });

  const setEdit = (next: boolean) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (next) nextParams.set("edit", "1");
      else nextParams.delete("edit");
      return nextParams;
    });
  };

  const loadUser = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await authService.getUserById(id);
      const row = data?.user as AdminUser | undefined;
      if (!row) throw new Error("User not found");

      setUser(row);
      setForm({
        full_name: row.full_name,
        phone: row.phone ?? "",
        business_name: row.business_name ?? "",
        role: row.role,
        status: row.status,
        verified: row.verified === true,
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load user",
      );
      navigate("/admin/users");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  const loadReports = React.useCallback(async () => {
    if (!id) return;
    setReportsLoading(true);
    setReportsError(null);
    try {
      const response = await reportService.getAdminReportsForUser(id, {
        page: 1,
        limit: 25,
      });
      setReports(response?.data?.reports || []);
    } catch (err: any) {
      setReports([]);
      setReportsError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load reports",
      );
    } finally {
      setReportsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const headerTitle = useMemo(() => {
    if (!user) return "User Details";
    return user.full_name || user.email;
  }, [user]);

  const reportsOpenCount = useMemo(() => {
    return reports.filter((r) => String(r.status || "open") === "open").length;
  }, [reports]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await authService.updateUser(id, form);
      const updated = response?.data?.user || response?.user;
      if (updated) setUser(updated);
      toast.success("User updated");
      setEdit(false);
      await loadUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await authService.approveUser(id);
      const updated = response?.data?.user || response?.user;
      if (updated) setUser(updated);
      toast.success("User approved");
      await loadUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await authService.suspendUser(id);
      const updated = response?.data?.user || response?.user;
      if (updated) setUser(updated);
      toast.success("User suspended");
      setSuspendDialogOpen(false);
      await loadUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to suspend user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReactivate = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await authService.reactivateUser(id);
      const updated = response?.data?.user || response?.user;
      if (updated) setUser(updated);
      toast.success("User reactivated");
      await loadUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reactivate user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{headerTitle}</h1>
            <p className="text-sm text-muted-foreground">Admin user details</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {user?.status === "pending" && (
            <Button
              onClick={() => void handleApprove()}
              disabled={isSaving || isLoading}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Approve
            </Button>
          )}

          {user?.status === "suspended" ? (
            <Button
              variant="outline"
              onClick={() => void handleReactivate()}
              disabled={isSaving || isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reactivate
            </Button>
          ) : user ? (
            <Button
              variant="destructive"
              onClick={() => setSuspendDialogOpen(true)}
              disabled={isSaving || isLoading}
              className="gap-2"
            >
              <ShieldOff className="h-4 w-4" />
              Suspend
            </Button>
          ) : null}

          {!editMode ? (
            <Button
              variant="outline"
              onClick={() => setEdit(true)}
              disabled={isSaving || isLoading}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (user) {
                    setForm({
                      full_name: user.full_name,
                      phone: user.phone ?? "",
                      business_name: user.business_name ?? "",
                      role: user.role,
                      status: user.status,
                      verified: user.verified === true,
                    });
                  }
                  setEdit(false);
                }}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading || !user ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback
                    className={cn("text-sm", roleBadgeClass[user.role])}
                  >
                    {getInitials(user.full_name || user.email)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="text-xl font-bold truncate">
                    {user.full_name || user.email}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        "gap-1 capitalize",
                        roleBadgeClass[user.role],
                      )}
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        statusBadgeClass[user.status],
                      )}
                    >
                      {user.status}
                    </Badge>
                    {user.verified ? (
                      <Badge className="bg-emerald-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not verified</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Joined
                  </div>
                  <div className="text-sm font-semibold">
                    {user.created_at ? formatDate(user.created_at) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Last login
                  </div>
                  <div className="text-sm font-semibold">
                    {user.last_login ? formatDate(user.last_login) : "Never"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="text-sm font-semibold">
                    {user.phone || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Business</div>
                  <div className="text-sm font-semibold">
                    {user.business_name || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "overview" | "reports")}
      >
        <TabsList className="grid w-full grid-cols-2 md:w-[420px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">
            Reports
            {reportsOpenCount > 0 ? (
              <Badge className="ml-2 bg-red-600">{reportsOpenCount}</Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading || !user ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input
                      value={form.full_name ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, full_name: e.target.value }))
                      }
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={form.phone ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business name</Label>
                    <Input
                      value={form.business_name ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          business_name: e.target.value,
                        }))
                      }
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={(form.role as any) ?? user.role}
                      onValueChange={(value) =>
                        setForm((p) => ({ ...p, role: value as any }))
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "retailer",
                            "distributor",
                            "factory",
                            "driver",
                            "admin",
                          ] as const
                        ).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={(form.status as any) ?? user.status}
                      onValueChange={(value) =>
                        setForm((p) => ({ ...p, status: value as any }))
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["pending", "active", "suspended"] as const).map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="verified"
                        checked={Boolean(form.verified)}
                        onCheckedChange={(checked) =>
                          setForm((p) => ({
                            ...p,
                            verified: checked === true,
                          }))
                        }
                        disabled={!editMode}
                      />
                      <Label htmlFor="verified">Verified</Label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Separator />
                    <div className="mt-4 text-xs text-muted-foreground">
                      User ID: <span className="font-mono">{user.id}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>Reports</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadReports()}
                  disabled={reportsLoading}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportsLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading reports...
                </div>
              ) : reportsError ? (
                <div className="text-sm text-red-600">{reportsError}</div>
              ) : reports.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No reports found.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border p-4 space-y-2"
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

                      {report.description ? (
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {report.description}
                        </p>
                      ) : null}

                      {report.order_id ? (
                        <p className="text-xs text-muted-foreground">
                          Order: {report.order_id}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend user</AlertDialogTitle>
            <AlertDialogDescription>
              Suspended users will not be able to log in or access their
              dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleSuspend()}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserDetailsPage;
