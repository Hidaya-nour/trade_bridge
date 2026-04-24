import React from "react";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import factoryAgentService from "@/services/factory-agent.service";
import documentService from "@/services/document.service";
import { useAuthStore } from "@/stores/auth.store";
import { EmptyState } from "@/components/shared/EmptyState";

type ContractType = "exclusive" | "non_exclusive" | "temporary" | "permanent";
type CommissionType = "percentage" | "fixed_amount" | "tiered";
type PaymentTerms = "monthly" | "quarterly" | "annually" | "upon_sale";

type AgentUser = {
  id: string;
  full_name?: string;
  business_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: string;
};

type ContractDocument = {
  id: string;
  file_secure_url?: string;
  original_file_name?: string;
  verification_status?: "pending" | "verified" | "rejected";
  reviewed_at?: string | Date | null;
};

type FactoryAgentContract = {
  id: string;
  factory_id: string;
  agent_id: string;
  contract_number: string;
  contract_document_id?: string | null;
  contract_document_url?: string | null;
  contract_document_name?: string | null;
  contract_type: ContractType;
  commission_rate: number | string;
  commission_type: CommissionType;
  min_sales_target?: number | string | null;
  max_sales_cap?: number | string | null;
  territory?: string | null;
  start_date: string | Date;
  end_date?: string | Date | null;
  renewal_date?: string | Date | null;
  payment_terms: PaymentTerms;
  last_sale_date?: string | Date | null;
  termination_reason?: string | null;
  agent?: AgentUser;
  contractDocument?: ContractDocument;
};

const statusBadgeClass: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  expired: "bg-red-100 text-red-700 border-red-200",
};

const getContractStatus = (row: FactoryAgentContract) => {
  if (row.termination_reason) return "inactive";
  const end = row.end_date ? new Date(row.end_date).getTime() : null;
  if (end !== null && end < Date.now()) return "expired";
  return "active";
};

const getContractUrl = (row: FactoryAgentContract) => {
  return (
    row.contract_document_url ||
    row.contractDocument?.file_secure_url ||
    undefined
  );
};

const toDateInput = (value: string | Date) =>
  typeof value === "string" ? value : value.toISOString();

const unwrap = (payload: any) => payload?.data ?? payload;

const FactoryAgentsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const [items, setItems] = React.useState<FactoryAgentContract[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive" | "expired"
  >("all");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);
  const [availableAgents, setAvailableAgents] = React.useState<AgentUser[]>([]);
  const [availableSearch, setAvailableSearch] = React.useState("");
  const [availableLoading, setAvailableLoading] = React.useState(false);

  const [agentId, setAgentId] = React.useState("");
  const [territory, setTerritory] = React.useState("");
  const [contractNumber, setContractNumber] = React.useState("");
  const [contractType, setContractType] = React.useState<ContractType>("exclusive");
  const [commissionRate, setCommissionRate] = React.useState("");
  const [commissionType, setCommissionType] =
    React.useState<CommissionType>("percentage");
  const [paymentTerms, setPaymentTerms] = React.useState<PaymentTerms>("monthly");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [minSalesTarget, setMinSalesTarget] = React.useState("");
  const [maxSalesCap, setMaxSalesCap] = React.useState("");
  const [contractFile, setContractFile] = React.useState<File | null>(null);

  const [terminateOpen, setTerminateOpen] = React.useState(false);
  const [terminateReason, setTerminateReason] = React.useState("");
  const [terminatingId, setTerminatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await factoryAgentService.getFactoryAgents();
      const data = unwrap(response);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setItems([]);
      setError(err?.response?.data?.message || err?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadAvailableAgents = React.useCallback(async (q?: string) => {
    setAvailableLoading(true);
    try {
      const response = await factoryAgentService.getAvailableAgents(q);
      const data = unwrap(response);
      setAvailableAgents(Array.isArray(data) ? data : []);
    } catch {
      setAvailableAgents([]);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!createOpen) return;
    void loadAvailableAgents();
  }, [createOpen, loadAvailableAgents]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((row) => {
      const status = getContractStatus(row);
      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (!q) return true;
      const agentName =
        row.agent?.business_name || row.agent?.full_name || row.agent_id;
      const territoryText = row.territory || "";
      return (
        agentName.toLowerCase().includes(q) ||
        territoryText.toLowerCase().includes(q) ||
        String(row.contract_number || "").toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const active = items.filter((r) => getContractStatus(r) === "active").length;
    const expiringSoon = items.filter((r) => {
      if (getContractStatus(r) !== "active") return false;
      if (!r.end_date) return false;
      const end = new Date(r.end_date).getTime();
      const days = Math.ceil((end - Date.now()) / (1000 * 3600 * 24));
      return days > 0 && days <= 30;
    }).length;
    return { total, active, expiringSoon };
  }, [items]);

  const resetCreateForm = () => {
    setAgentId("");
    setTerritory("");
    setContractNumber("");
    setContractType("exclusive");
    setCommissionRate("");
    setCommissionType("percentage");
    setPaymentTerms("monthly");
    setStartDate("");
    setEndDate("");
    setMinSalesTarget("");
    setMaxSalesCap("");
    setContractFile(null);
    setAvailableSearch("");
  };

  const handleCreate = async () => {
    if (!user) return;

    if (!agentId) return toast.error("Select an agent (distributor).");
    if (!contractNumber.trim()) return toast.error("Contract number is required.");
    if (!commissionRate.trim()) return toast.error("Commission rate is required.");
    if (!startDate) return toast.error("Start date is required.");
    if (!contractFile) return toast.error("Partnership contract file is required.");

    const commission = Number(commissionRate);
    if (Number.isNaN(commission) || commission < 0) {
      return toast.error("Commission rate must be a valid number.");
    }

    setCreateLoading(true);
    const toastId = toast.loading("Creating agent contract...");
    try {
      const uploadRes = await documentService.uploadDocument(
        contractFile,
        "other",
      );
      const uploadedDoc = (uploadRes as any)?.data || (uploadRes as any);
      const doc = uploadedDoc?.id ? uploadedDoc : uploadedDoc?.data;

      const payload = {
        factory_id: user.id,
        agent_id: agentId,
        contract_number: contractNumber.trim(),
        contract_document_id: doc?.id,
        contract_document_url: doc?.file_secure_url,
        contract_document_name: doc?.original_file_name,
        contract_type: contractType,
        commission_rate: commission,
        commission_type: commissionType,
        min_sales_target: minSalesTarget.trim()
          ? Number(minSalesTarget)
          : undefined,
        max_sales_cap: maxSalesCap.trim() ? Number(maxSalesCap) : undefined,
        territory: territory.trim() || undefined,
        start_date: startDate,
        end_date: endDate || undefined,
        payment_terms: paymentTerms,
      };

      await factoryAgentService.create(payload);
      toast.success("Agent linked successfully", { id: toastId });
      setCreateOpen(false);
      resetCreateForm();
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create agent contract", {
        id: toastId,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const openTerminate = (id: string) => {
    setTerminatingId(id);
    setTerminateReason("");
    setTerminateOpen(true);
  };

  const handleTerminate = async () => {
    if (!terminatingId) return;
    if (!terminateReason.trim()) {
      toast.error("Termination reason is required.");
      return;
    }

    const toastId = toast.loading("Terminating contract...");
    setCreateLoading(true);
    try {
      await factoryAgentService.terminate(terminatingId, terminateReason.trim());
      toast.success("Contract terminated", { id: toastId });
      setTerminateOpen(false);
      setTerminatingId(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to terminate contract", {
        id: toastId,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  if (user?.role !== "factory") {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={ShieldAlert}
          title="Factory access only"
          description="Only factory accounts can manage sales agents."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factory Agents</h1>
          <p className="text-muted-foreground mt-1">
            Link distributor users as your sales agents and manage contracts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Link Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Expiring (30d)</div>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by agent, territory, contract..."
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as any)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No agents found"
              description="Link a distributor as an agent to get started."
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const status = getContractStatus(row);
                    const agentName =
                      row.agent?.business_name ||
                      row.agent?.full_name ||
                      row.agent_id;
                    const url = getContractUrl(row);
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          <div className="min-w-0">
                            <div className="truncate">{agentName}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {row.agent?.email || "—"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{row.territory || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">{row.contract_number}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {row.contract_type.replace("_", " ")}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="text-sm">
                            {String(row.commission_rate)}
                            {row.commission_type === "percentage" ? "%" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          <div>Start: {formatDate(toDateInput(row.start_date))}</div>
                          <div className="text-xs text-muted-foreground">
                            End:{" "}
                            {row.end_date ? formatDate(toDateInput(row.end_date)) : "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("capitalize", statusBadgeClass[status])}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!url}
                              onClick={() => {
                                if (!url) return;
                                window.open(url, "_blank", "noopener,noreferrer");
                              }}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Contract
                            </Button>
                            {status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => openTerminate(row.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Link Sales Agent</DialogTitle>
            <DialogDescription>
              Choose a distributor user to represent your factory and upload the partnership contract.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label>Search distributors</Label>
              <div className="flex gap-2">
                <Input
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  placeholder="Search by name, business, or email..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadAvailableAgents(availableSearch)}
                  disabled={availableLoading}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  {availableLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Agent (Distributor)</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select distributor user" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((a) => {
                    const label = a.business_name || a.full_name || a.email || a.id;
                    const sub = [a.email, a.phone].filter(Boolean).join(" • ");
                    return (
                      <SelectItem key={a.id} value={a.id}>
                        {label}
                        {sub ? ` — ${sub}` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Territory (optional)</Label>
              <Input value={territory} onChange={(e) => setTerritory(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Contract number</Label>
              <Input
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="e.g. CT-2026-001"
              />
            </div>

            <div className="space-y-2">
              <Label>Contract type</Label>
              <Select
                value={contractType}
                onValueChange={(v) => setContractType(v as ContractType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                  <SelectItem value="non_exclusive">Non-exclusive</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment terms</Label>
              <Select
                value={paymentTerms}
                onValueChange={(v) => setPaymentTerms(v as PaymentTerms)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="upon_sale">Upon sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Commission rate</Label>
              <Input
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>

            <div className="space-y-2">
              <Label>Commission type</Label>
              <Select
                value={commissionType}
                onValueChange={(v) => setCommissionType(v as CommissionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>End date (optional)</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Min sales target (optional)</Label>
              <Input value={minSalesTarget} onChange={(e) => setMinSalesTarget(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Max sales cap (optional)</Label>
              <Input value={maxSalesCap} onChange={(e) => setMaxSalesCap(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Partnership contract (PDF/JPG/PNG/WEBP)</Label>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setContractFile(e.target.files?.[0] || null)}
              />
              {contractFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {contractFile.name}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={createLoading} className="gap-2">
              <Plus className="h-4 w-4" />
              {createLoading ? "Linking..." : "Link Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate contract</DialogTitle>
            <DialogDescription>
              Provide a reason. This sets an end date and marks the contract inactive.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
              placeholder="e.g. Contract ended by mutual agreement"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateOpen(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleTerminate()} disabled={createLoading}>
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FactoryAgentsPage;
