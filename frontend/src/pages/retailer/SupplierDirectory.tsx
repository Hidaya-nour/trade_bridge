import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Filter,
  MapPin,
  Package,
  Search,
  Store,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import supplierService, {
  type SupplierListItem,
} from "@/services/supplier.service";

const getDisplayName = (supplier: SupplierListItem) =>
  supplier.business_name || supplier.full_name || "Supplier";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getSupplierTypeLabel = (role?: string) => {
  if (role === "factory") return "Factory";
  if (role === "distributor") return "Distributor";
  return "Supplier";
};

const getSupplierLocation = (supplier: SupplierListItem) => {
  const addr = Array.isArray(supplier.addresses) ? supplier.addresses[0] : null;
  const city = addr?.city?.trim();
  const region = addr?.region?.trim();
  if (city && region) return `${city}, ${region}`;
  if (city) return city;
  if (region) return region;
  return "";
};

const SupplierDirectoryPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "name">("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await supplierService.getAllSuppliers();
        const list = res?.data?.suppliers || [];
        if (!cancelled) setSuppliers(list);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load suppliers";
        if (!cancelled) setLoadError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const typeOptions = useMemo(() => {
    const roles = new Set<string>();
    suppliers.forEach((s) => {
      if (s.role) roles.add(s.role);
    });
    return ["All Types", ...Array.from(roles).map(getSupplierTypeLabel).sort()];
  }, [suppliers]);

  const locationOptions = useMemo(() => {
    const locs = new Set<string>();
    suppliers.forEach((s) => {
      const loc = getSupplierLocation(s);
      if (loc) locs.add(loc);
    });
    return ["All Locations", ...Array.from(locs).sort()];
  }, [suppliers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedLocation, verifiedOnly, sortBy]);

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return suppliers.filter((s) => {
      const name = getDisplayName(s);
      const loc = getSupplierLocation(s);
      const type = getSupplierTypeLabel(s.role);

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        loc.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q);

      const matchesType = selectedType === "All Types" || type === selectedType;
      const matchesLocation =
        selectedLocation === "All Locations" || loc === selectedLocation;
      const matchesVerified = !verifiedOnly || s.verified === true;

      return matchesSearch && matchesType && matchesLocation && matchesVerified;
    });
  }, [suppliers, searchQuery, selectedType, selectedLocation, verifiedOnly]);

  const sortedSuppliers = useMemo(() => {
    const list = [...filteredSuppliers];

    list.sort((a, b) => {
      if (sortBy === "name") {
        return getDisplayName(a).localeCompare(getDisplayName(b));
      }

      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    return list;
  }, [filteredSuppliers, sortBy]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = sortedSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and discover verified suppliers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Store className="h-3.5 w-3.5 mr-1" />
            {filteredSuppliers.length} Suppliers
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, type, or location..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Filter Suppliers</SheetTitle>
                    <SheetDescription>
                      Narrow down suppliers by type and location
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="flex-1 h-[calc(100vh-120px)] pr-4">
                    <div className="space-y-6 py-4">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Supplier Type</h3>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Location</h3>
                        <Select
                          value={selectedLocation}
                          onValueChange={setSelectedLocation}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locationOptions.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified"
                          checked={verifiedOnly}
                          onCheckedChange={(checked) =>
                            setVerifiedOnly(checked as boolean)
                          }
                        />
                        <Label htmlFor="verified" className="text-sm">
                          Verified suppliers only
                        </Label>
                      </div>
                    </div>
                  </ScrollArea>

                  <SheetFooter className="border-t pt-4">
                    <div className="flex w-full gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedType("All Types");
                          setSelectedLocation("All Locations");
                          setVerifiedOnly(false);
                        }}
                      >
                        Reset
                      </Button>
                      <SheetClose asChild>
                        <Button className="flex-1">Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      {(selectedType !== "All Types" ||
        selectedLocation !== "All Locations" ||
        verifiedOnly) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {selectedType !== "All Types" && (
            <Badge variant="secondary" className="gap-1">
              Type: {selectedType}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSelectedType("All Types")}
              />
            </Badge>
          )}

          {selectedLocation !== "All Locations" && (
            <Badge variant="secondary" className="gap-1">
              Location: {selectedLocation}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSelectedLocation("All Locations")}
              />
            </Badge>
          )}

          {verifiedOnly && (
            <Badge variant="secondary" className="gap-1">
              Verified Only
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setVerifiedOnly(false)}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setSelectedType("All Types");
              setSelectedLocation("All Locations");
              setVerifiedOnly(false);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {sortedSuppliers.length === 0 ? 0 : indexOfFirstItem + 1}-
        {Math.min(indexOfLastItem, sortedSuppliers.length)} of{" "}
        {sortedSuppliers.length} suppliers
      </div>

      {isLoading ? (
        <Card className="py-12">
          <div className="text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading suppliers…</h3>
            <p className="text-muted-foreground">
              Fetching the latest supplier directory.
            </p>
          </div>
        </Card>
      ) : loadError ? (
        <Card className="py-12">
          <div className="text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load suppliers
            </h3>
            <p className="text-muted-foreground mb-4">{loadError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : sortedSuppliers.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All Types");
                setSelectedLocation("All Locations");
                setVerifiedOnly(false);
              }}
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSuppliers.map((supplier) => {
            const name = getDisplayName(supplier);
            const type = getSupplierTypeLabel(supplier.role);
            const loc = getSupplierLocation(supplier);

            return (
              <Card
                key={supplier.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={supplier.profile_image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/retailer/suppliers/${supplier.id}`}
                            className="text-lg font-semibold hover:text-primary transition-colors"
                          >
                            {name}
                          </Link>
                          {supplier.verified === true && (
                            <Badge
                              variant="outline"
                              className="h-5 px-1 bg-primary/5 border-primary/20"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                          {loc ? (
                            <>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {loc}
                              </span>
                            </>
                          ) : null}
                        </div>

                        {supplier.created_at ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            Joined{" "}
                            {new Date(supplier.created_at).toLocaleDateString()}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="flex-1" asChild>
                      <Link to={`/retailer/suppliers/${supplier.id}`}>
                        View Profile
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SupplierDirectoryPage;

