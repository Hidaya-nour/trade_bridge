import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, ChevronRight, Package, Star } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { formatPrice } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import productService from "@/services/product.service";
import supplierService from "@/services/supplier.service";
import SupplierReviewDialog from "@/components/supplier/SupplierReviewDialog";

const DistributorFactoryProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const supplierId = String(id || "");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [supplier, setSupplier] = React.useState<any | null>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = React.useState<{
    average_rating: number;
    total_reviews: number;
  }>({ average_rating: 0, total_reviews: 0 });

  const [reviewOpen, setReviewOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    setError(null);
    try {
      const [supplierRes, productRes, reviewsRes] = await Promise.allSettled([
        supplierService.getSupplierById(supplierId),
        productService.getProductsBySupplier(supplierId),
        supplierService.getSupplierReviews(supplierId, { page: 1, limit: 10 }),
      ]);

      if (supplierRes.status === "fulfilled") {
        setSupplier(supplierRes.value.data.supplier);
      } else {
        throw supplierRes.reason;
      }

      if (productRes.status === "fulfilled") {
        setProducts(productRes.value.data.products || []);
      } else {
        setProducts([]);
      }

      if (reviewsRes.status === "fulfilled") {
        setReviews(reviewsRes.value.data.reviews || []);
        setReviewSummary({
          average_rating: Number(reviewsRes.value.data.average_rating || 0),
          total_reviews: Number(reviewsRes.value.data.total_reviews || 0),
        });
      } else {
        setReviews([]);
        setReviewSummary({ average_rating: 0, total_reviews: 0 });
        toast.error(
          reviewsRes.reason?.response?.data?.message ||
            "Failed to load factory reviews",
        );
      }
    } catch (err: any) {
      console.error("Failed to load factory profile", err);
      setError(err?.response?.data?.message || "Failed to load factory profile");
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const supplierName = supplier?.business_name || supplier?.full_name || "Factory";

  if (!supplierId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">Factory not found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{supplierName}</h1>
            <p className="text-sm text-muted-foreground">Factory profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setReviewOpen(true)}
            disabled={loading}
          >
            <Star className="h-4 w-4 mr-2" />
            Rate Factory
          </Button>
          <Button asChild>
            <Link to={`/distributor/marketplace`}>
              Marketplace
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading factory profile…
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-red-600">{error}</div>
            <Button className="mt-4" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={supplier?.profile_image || ""} />
                    <AvatarFallback>{getInitials(supplierName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{supplierName}</div>
                      {supplier?.verified ? (
                        <Badge className="bg-emerald-600">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      <span>
                        {supplier?.role === "factory"
                          ? "Factory"
                          : supplier?.role === "distributor"
                            ? "Distributor"
                            : "Supplier"}
                      </span>
                      <span>•</span>
                      <span>
                        {reviewSummary.average_rating.toFixed(2)} (
                        {reviewSummary.total_reviews})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Products
                    </div>
                    <div className="font-semibold">{products.length}</div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">VAT</div>
                    <div className="font-semibold">
                      {supplier?.is_vat_registered ? "Registered" : "No"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="products">
            <TabsList className="grid w-full grid-cols-2 md:w-[420px]">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No products found for this factory.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 18).map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-1">
                          {product.name}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-lg font-bold text-primary">
                              {formatPrice(Number(product.price || 0))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              MOQ: {product.min_order_amount}
                            </div>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/distributor/products/${product.id}`}>
                              <Package className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Factory Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No reviews yet.
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {review.user_name || "Buyer"}
                          </div>
                          <div className="text-sm">
                            {Number(review.rating || 0)}/5
                          </div>
                        </div>
                        {review.comment ? (
                          <div className="text-sm text-muted-foreground mt-2">
                            {review.comment}
                          </div>
                        ) : null}
                        {review.verified_purchase ? (
                          <div className="text-xs text-emerald-700 mt-3">
                            Verified purchase
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <SupplierReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        supplierId={supplierId}
        supplierName={supplierName}
        onSubmitted={() => {
          toast.success("Refreshing factory reviews…");
          void load();
        }}
      />
    </div>
  );
};

export default DistributorFactoryProfilePage;
