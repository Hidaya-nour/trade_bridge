import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, formatPrice } from "@/lib/formatters";
import { useDisputeStore } from "@/stores/dispute.store";

type MyDisputesPageProps = {
  role: "retailer" | "distributor" | "factory";
};

const prettifyReason = (reason?: string) =>
  (reason || "other")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveStatusTone = (status?: string) => {
  switch (status) {
    case "resolved":
    case "closed":
      return "bg-green-100 text-green-800";
    case "investigating":
    case "escalated":
      return "bg-amber-100 text-amber-800";
    case "open":
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const resolveOrderLink = (role: MyDisputesPageProps["role"], orderId?: string) =>
  orderId ? `/${role}/orders/${orderId}` : null;

const MyDisputesPage: React.FC<MyDisputesPageProps> = ({ role }) => {
  const { items, isLoading, error, fetchAll } = useDisputeStore();
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    void fetchAll({
      status,
      search: search.trim() || undefined,
      limit: 100,
      offset: 0,
    });
  }, [fetchAll, search, status]);

  const disputes = useMemo(() => {
    const normalized = (items || []).map((d: any) => ({
      id: String(d.id),
      orderId: String(d.order_id || d.order?.id || ""),
      orderTotal: Number(d.amount || d.order_total || 0),
      status: String(d.status || "open"),
      reason: String(d.reason || "other"),
      description: String(d.description || ""),
      againstName:
        d.against?.business_name || d.against?.full_name || "Other party",
      createdAt: d.created_at || new Date().toISOString(),
    }));

    // Extra local filter to keep UI responsive even if backend ignores params.
    const q = search.trim().toLowerCase();
    return normalized.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (!q) return true;
      return (
        d.id.toLowerCase().includes(q) ||
        d.orderId.toLowerCase().includes(q) ||
        d.againstName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    });
  }, [items, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Disputes</h1>
          <p className="text-sm text-muted-foreground">
            Track disputes you raised and their status.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order, user, or text…"
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && !isLoading ? (
        <div className="text-sm text-muted-foreground">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading disputes…</div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No disputes found"
          description="When you raise a dispute from an order, it will show up here."
        />
      ) : (
        <div className="grid gap-4">
          {disputes.map((dispute) => {
            const orderLink = resolveOrderLink(role, dispute.orderId);
            return (
              <Card key={dispute.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-base">
                      Dispute #{dispute.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={resolveStatusTone(dispute.status)}>
                        {dispute.status}
                      </Badge>
                      <Badge variant="outline">
                        {prettifyReason(dispute.reason)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Against: <span className="text-foreground">{dispute.againstName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Order total:{" "}
                    <span className="text-foreground">
                      {formatPrice(dispute.orderTotal)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Raised:{" "}
                    <span className="text-foreground">
                      {formatDateTime(dispute.createdAt)}
                    </span>
                  </div>
                  {dispute.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {dispute.description}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {orderLink && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={orderLink}>Open order</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDisputesPage;

