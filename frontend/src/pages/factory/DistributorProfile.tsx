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

const FactoryDistributorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const distributorId = String(id || "");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [distributor, setDistributor] = React.useState<any | null>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = React.useState<{
    average_rating: number;
    total_reviews: number;
  }>({ average_rating: 0, total_reviews: 0 });

  const [reviewOpen, setReviewOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!distributorId) return;
    setLoading(true);
    setError(null);
    try {
      const [supplierRes, productRes, reviewsRes] = await Promise.allSettled([
        supplierService.getSupplierById(distributorId),
        productService.getProductsBySupplier(distributorId),
        supplierService.getSupplierReviews(distributorId, { page: 1, limit: 10 }),
      ]);

      if (supplierRes.status === "fulfilled") {
        setDistributor(supplierRes.value.data.supplier);
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
          (reviewsRes as any).reason?.response?.data?.message ||
            "Failed to load distributor reviews",
        );
      }
    } catch (err: any) {
      console.error("Failed to load distributor profile", err);
      setError(
        err?.response?.data?.message || "Failed to load distributor profile",
      );
    } finally {
      setLoading(false);
    }
  }, [distributorId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const distributorName =
    distributor?.business_name || distributor?.full_name || "Distributor";

  if (!distributorId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">Distributor not found.</CardContent>
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
            <h1 className="text-2xl font-bold">{distributorName}</h1>
            <p className="text-sm text-muted-foreground">Distributor profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setReviewOpen(true)}
            disabled={loading}
          >
            <Star className="h-4 w-4 mr-2" />
            Rate Distributor
          </Button>
          <Button asChild>
            <Link to={`/messages?user=${encodeURIComponent(distributorId)}`}>
              Message
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading distributor profile...
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
                    <AvatarImage src={distributor?.profile_image || ""} />
                    <AvatarFallback>
                      {getInitials(distributorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{distributorName}</div>
                      {distributor?.verified ? (
                        <Badge className="bg-emerald-600">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      <span>Distributor</span>
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
                    <div className="text-sm text-muted-foreground">Products</div>
                    <div className="font-semibold">{products.length}</div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">VAT</div>
                    <div className="font-semibold">
                      {distributor?.is_vat_registered ? "Registered" : "No"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No products found.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {product.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-medium">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">SKU</span>
                          <span className="font-medium">
                            {product.sku || product.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Package className="h-3.5 w-3.5" />
                          <span>
                            {Number(product.stock_quantity || 0)} in stock
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No reviews yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {review.reviewer?.business_name ||
                              review.reviewer?.full_name ||
                              "Reviewer"}
                          </div>
                          <Badge variant="outline">
                            {Number(review.rating || 0).toFixed(1)}
                          </Badge>
                        </div>
                        {review.comment ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      <SupplierReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        supplierId={distributorId}
        supplierName={distributorName}
      />
    </div>
  );
};

export default FactoryDistributorProfilePage;

