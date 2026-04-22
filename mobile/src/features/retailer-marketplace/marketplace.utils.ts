import { type Product, type ProductSupplier } from "@/features/products/product.types";
import { type Supplier, type SupplierAddress, type SupplierDirectoryItem } from "@/features/suppliers/supplier.types";

const DEFAULT_VAT_RATE = 0.15;
const CHECKOUT_DISTANCE_KM = 1;

export const formatCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value || 0);

export const getSupplierName = (
  supplier?: Pick<Supplier, "business_name" | "full_name"> | Pick<ProductSupplier, "business_name" | "full_name"> | null,
) => supplier?.business_name || supplier?.full_name || "Unknown Supplier";

export const getSupplierInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const getLocationLabel = (addresses?: SupplierAddress[] | null) => {
  const primaryAddress = addresses?.[0];

  if (!primaryAddress) {
    return "Location pending";
  }

  const city = primaryAddress.city?.trim();
  const region = primaryAddress.region?.trim();

  if (city && region) {
    return `${city}, ${region}`;
  }

  return city || region || "Location pending";
};

export const getProductLocationLabel = (product: Product) => {
  return getLocationLabel(product.supplier?.addresses);
};

export const resolveProductVatRate = (
  product?: Partial<Product> & { supplier?: Partial<ProductSupplier> | null },
) => {
  const supplier = product?.supplier;
  if (!supplier || (supplier.is_verified === false && supplier.verified === false && supplier.is_vat_registered !== true)) {
    return 0;
  }

  if (supplier.is_vat_registered !== true) {
    return 0;
  }

  const parsedRate = Number(supplier.vat_rate);
  if (Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 1) {
    return parsedRate;
  }

  return DEFAULT_VAT_RATE;
};

export const resolveProductShipping = (product?: Partial<Product> | null) => {
  if (!product) {
    return { shipping: 0, blocked: false };
  }

  const deliveryAvailable = product.delivery_available !== false;
  if (!deliveryAvailable) {
    return { shipping: 0, blocked: true };
  }

  const feePerKm = Number(product.delivery_fee_per_km || 0);
  const pricing = String(product.delivery_pricing || "").toLowerCase();
  const freeMaxKm =
    product.free_delivery_max_distance_km !== null &&
    product.free_delivery_max_distance_km !== undefined
      ? Number(product.free_delivery_max_distance_km)
      : null;

  if (freeMaxKm !== null && CHECKOUT_DISTANCE_KM <= freeMaxKm) {
    return { shipping: 0, blocked: false };
  }

  if (pricing === "paid" || feePerKm > 0) {
    return {
      shipping: Number((feePerKm * CHECKOUT_DISTANCE_KM).toFixed(2)),
      blocked: false,
    };
  }

  return { shipping: 0, blocked: false };
};

export const deriveSupplierDirectory = (
  products: Product[],
  suppliers: Supplier[],
): SupplierDirectoryItem[] => {
  const directory = new Map<
    string,
    SupplierDirectoryItem & {
      categorySet: Set<string>;
      sampleProductSet: Set<string>;
      ratingTotal: number;
      ratedProductCount: number;
    }
  >();

  const ensureEntry = (supplierId: string, source?: Supplier | ProductSupplier | null) => {
    if (!directory.has(supplierId)) {
      const name = getSupplierName(source);
      directory.set(supplierId, {
        id: supplierId,
        name,
        business_name: "business_name" in (source || {}) ? source?.business_name : undefined,
        full_name: source?.full_name,
        email: "email" in (source || {}) ? source?.email : undefined,
        phone: "phone" in (source || {}) ? source?.phone : undefined,
        profile_image: "profile_image" in (source || {}) ? source?.profile_image : undefined,
        role: "role" in (source || {}) ? source?.role : undefined,
        created_at: "created_at" in (source || {}) ? String(source?.created_at || "") : undefined,
        verified: "verified" in (source || {}) ? source?.verified : undefined,
        is_verified: "is_verified" in (source || {}) ? source?.is_verified : undefined,
        addresses: "addresses" in (source || {}) ? source?.addresses : undefined,
        total_orders: "total_orders" in (source || {}) ? source?.total_orders : undefined,
        total_products: "total_products" in (source || {}) ? source?.total_products : undefined,
        verifiedState: Boolean(
          ("verified" in (source || {}) && source?.verified) ||
            ("is_verified" in (source || {}) && source?.is_verified),
        ),
        locationLabel:
          "addresses" in (source || {}) ? getLocationLabel(source?.addresses) : "Location pending",
        categories: [],
        productCount: 0,
        reviewCount: 0,
        averageRating: 0,
        minOrderAmount: undefined,
        startingPrice: undefined,
        sampleProducts: [],
        categorySet: new Set<string>(),
        sampleProductSet: new Set<string>(),
        ratingTotal: 0,
        ratedProductCount: 0,
      });
    }

    return directory.get(supplierId)!;
  };

  suppliers.forEach((supplier) => {
    const entry = ensureEntry(supplier.id, supplier);
    entry.business_name = supplier.business_name || entry.business_name;
    entry.full_name = supplier.full_name || entry.full_name;
    entry.email = supplier.email || entry.email;
    entry.phone = supplier.phone || entry.phone;
    entry.role = supplier.role || entry.role;
    entry.addresses = supplier.addresses || entry.addresses;
    entry.locationLabel = getLocationLabel(entry.addresses);
    entry.verifiedState = Boolean(supplier.verified ?? supplier.is_verified ?? entry.verifiedState);
    entry.total_orders = supplier.total_orders ?? entry.total_orders;
    entry.total_products = supplier.total_products ?? entry.total_products;
  });

  products.forEach((product) => {
    const entry = ensureEntry(product.supplier_id, product.supplier);

    entry.name = getSupplierName(product.supplier) || entry.name;
    entry.verifiedState = Boolean(product.supplier?.is_verified ?? entry.verifiedState);
    entry.addresses = product.supplier?.addresses || entry.addresses;
    entry.locationLabel = getLocationLabel(entry.addresses);

    if (product.category) {
      entry.categorySet.add(product.category);
    }

    if (product.name) {
      entry.sampleProductSet.add(product.name);
    }

    entry.productCount += 1;
    entry.reviewCount += Number(product.review_count || 0);

    if (Number(product.rating || 0) > 0) {
      entry.ratingTotal += Number(product.rating || 0);
      entry.ratedProductCount += 1;
    }

    const minOrderAmount = Number(product.min_order_amount || 0);
    if (!entry.minOrderAmount || minOrderAmount < entry.minOrderAmount) {
      entry.minOrderAmount = minOrderAmount;
    }

    const startingPrice = Number(product.price || 0);
    if (!entry.startingPrice || startingPrice < entry.startingPrice) {
      entry.startingPrice = startingPrice;
    }
  });

  return Array.from(directory.values())
    .map((entry) => ({
      ...entry,
      categories: Array.from(entry.categorySet),
      sampleProducts: Array.from(entry.sampleProductSet).slice(0, 3),
      averageRating:
        entry.ratedProductCount > 0 ? Number((entry.ratingTotal / entry.ratedProductCount).toFixed(1)) : 0,
    }))
    .sort((a, b) => {
      if (b.verifiedState !== a.verifiedState) {
        return Number(b.verifiedState) - Number(a.verifiedState);
      }

      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }

      return a.name.localeCompare(b.name);
    });
};
