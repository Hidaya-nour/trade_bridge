import React from "react";
import { useParams } from "react-router-dom";
import {
  PartnerProfile,
  type PartnerProfileConfig,
} from "@/components/shared/PartnerProfile";
import { Package, ShoppingCart, FileText } from "lucide-react";

// Mock data
const mockSupplier = {
  id: 101,
  name: "Ethiopia Coffee Export",
  type: "distributor" as const,
  verified: true,
  tier: "platinum" as const,
  description:
    "Leading exporter of premium Ethiopian coffee. Specializing in Yirgacheffe, Sidamo, and Limu varieties. Committed to quality and sustainability.",
  established: "2015",
  employees: "50-100",
  website: "https://ethiopiacoffee.com",
  location: "Addis Ababa",
  region: "Central",
  address: "Bole Road, Addis Ababa",
  contactPerson: "Bereket Tesfaye",
  contactPhone: "+251 11 345 6789",
  contactEmail: "bereket.t@ethiopiacoffee.com",
  alternatePhone: "+251 91 234 5678",
  businessType: ["Exporter", "Processor"],
  categories: ["Coffee", "Nuts", "Spices"],
  products: 45,
  rating: 4.9,
  review_count: 128,
  totalOrders: 312,
  totalValue: 7800000,
  avgOrderValue: 25000,
  onTimeDelivery: 99.2,
  responseTime: "< 30 minutes",
  creditLimit: 1000000,
  creditUsed: 420000,
  paymentTerms: "Net 30",
  contractStart: "2024-02-01",
  contractEnd: "2027-01-31",
  contractStatus: "active" as const,
  certificates: ["Organic", "Fair Trade", "ISO 9001"],
  recentOrders: [
    {
      id: "ORD-2026-0892",
      date: "2026-02-10",
      amount: 15262.5,
      status: "delivered",
    },
    {
      id: "ORD-2026-0885",
      date: "2026-02-08",
      amount: 13460,
      status: "shipped",
    },
    {
      id: "ORD-2026-0878",
      date: "2026-02-05",
      amount: 37300,
      status: "processing",
    },
  ],
  recentReviews: [
    {
      id: 1,
      user: "Hidaya N.",
      rating: 5,
      comment: "Excellent quality coffee, fast delivery!",
      date: "2026-02-10",
    },
    {
      id: 2,
      user: "Abebe K.",
      rating: 5,
      comment: "Best supplier I've worked with. Highly recommended.",
      date: "2026-02-05",
    },
  ],
};

const SupplierProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const config: PartnerProfileConfig = {
    role: "retailer",
    partnerType: "Supplier",
    backPath: "/retailer/suppliers",
    actionButtons: [
      {
        label: "View Products",
        path: `/retailer/products?supplier=${id}`,
        icon: Package,
      },
      {
        label: "Place Order",
        path: `/retailer/cart?supplier=${id}`,
        icon: ShoppingCart,
      },
      {
        label: "Contract",
        path: `/retailer/contracts/${id}`,
        icon: FileText,
        variant: "outline",
      },
    ],
  };

  return <PartnerProfile config={config} profile={mockSupplier} />;
};

export default SupplierProfilePage;
