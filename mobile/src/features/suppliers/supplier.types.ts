export interface SupplierAddress {
  id?: string;
  region?: string;
  city?: string;
  subcity?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Supplier {
  id: string;
  business_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: "factory" | "distributor";
  verified?: boolean;
  is_verified?: boolean;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
  total_products?: number;
  total_orders?: number;
  rating?: number;
  addresses?: SupplierAddress[];
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
}

export interface SupplierDirectoryItem extends Supplier {
  name: string;
  verifiedState: boolean;
  locationLabel: string;
  categories: string[];
  productCount: number;
  reviewCount: number;
  averageRating: number;
  minOrderAmount?: number;
  startingPrice?: number;
  sampleProducts: string[];
}
