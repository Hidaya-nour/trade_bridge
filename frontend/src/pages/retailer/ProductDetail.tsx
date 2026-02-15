import { ProductDetail } from "@/components/shared/ProductDetails";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock data - would come from API
const mockProduct = {
  id: 1,
  name: "Yirgacheffe Coffee",
  sku: "COF-004",
  category: "Beverages",
  subcategory: "Coffee",
  price: 450,
  unit: "kg",
  minOrder: 10,
  maxOrder: 100,
  stock: 2450,
  available: 2150,
  description:
    "Premium Yirgacheffe coffee beans, washed process, grade 1. Known for its floral and citrus notes. Grown in the highlands of Ethiopia at elevations between 1,700-2,200 meters.",
  specifications: {
    Origin: "Yirgacheffe, Ethiopia",
    Processing: "Washed",
    Grade: "1",
    Altitude: "1,700-2,200m",
    Varietal: "Heirloom",
    Certification: "Organic, Fair Trade",
  },
  tags: ["Organic", "Fair Trade", "Premium", "Single Origin"],
  images: [],

  supplierId: 101,
  supplierName: "Ethiopia Coffee Export",
  supplierType: "distributor" as const, // ✅ FIX: Add 'as const'
  supplierRating: 4.9,
  supplierVerified: true,
  supplierLocation: "Addis Ababa",
  supplierEstablished: "2015",

  deliveryOptions: {
    offered: true,
    cost: 250,
    freeThreshold: 5000,
    estimatedDays: "2-3 days",
    pickupAvailable: true,
  },

  bulkDiscounts: [
    { quantity: 50, discount: 5 },
    { quantity: 100, discount: 10 },
    { quantity: 500, discount: 15 },
  ],

  rating: 4.9,
  reviewCount: 128,
  reviews: [
    {
      id: 1,
      user: "Hidaya N.",
      rating: 5,
      comment: "Excellent coffee, authentic Yirgacheffe flavor. Fast delivery!",
      date: "2026-02-10",
    },
    {
      id: 2,
      user: "Abebe K.",
      rating: 5,
      comment: "Best coffee I've found on the platform. Will order again.",
      date: "2026-02-05",
    },
  ],

  relatedProducts: [
    { id: 4, name: "Macadamia Nuts", price: 650, unit: "kg", rating: 4.9 },
    { id: 6, name: "Pure Honey", price: 280, unit: "jar", rating: 4.8 },
    { id: 2, name: "White Teff Flour", price: 120, unit: "kg", rating: 4.7 },
    { id: 8, name: "Steel Rebars", price: 8500, unit: "ton", rating: 4.6 },
  ],
};

const RetailerProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleAddToCart = (quantity: number) => {
    console.log(`Adding ${quantity} of product ${id} to cart`);
    // API call here
    navigate("/retailer/cart");
  };

  const handleCompare = () => {
    navigate(`/retailer/compare?product=${id}`);
  };

  return (
    <ProductDetail
      role="retailer"
      product={mockProduct}
      onAddToCart={handleAddToCart}
      onCompare={handleCompare}
    />
  );
};

export default RetailerProductDetailPage;
