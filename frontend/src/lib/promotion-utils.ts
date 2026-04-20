import type { BroadcastRecord } from "@/types/broadcast.types";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const applyDiscountToUnitPrice = (
  baseUnitPrice: number,
  quantity: number,
  promotion: BroadcastRecord | null,
) => {
  if (!promotion) return baseUnitPrice;
  if (promotion.type !== "discount") return baseUnitPrice;

  const discountType = promotion.discount_type;
  const discountValue =
    promotion.discount_value !== null && promotion.discount_value !== undefined
      ? toNumber(promotion.discount_value, 0)
      : 0;
  const maxDiscount =
    promotion.max_discount !== null && promotion.max_discount !== undefined
      ? toNumber(promotion.max_discount, 0)
      : null;

  if (!discountType || discountValue <= 0) return baseUnitPrice;

  let perUnitDiscount = 0;
  if (discountType === "percentage") {
    perUnitDiscount = baseUnitPrice * Math.min(100, discountValue) / 100;
  } else if (discountType === "fixed") {
    perUnitDiscount = discountValue;
  }

  let totalDiscount = perUnitDiscount * Math.max(1, quantity);
  if (maxDiscount !== null && maxDiscount > 0) {
    totalDiscount = Math.min(totalDiscount, maxDiscount);
  }

  const unitPrice = baseUnitPrice - totalDiscount / Math.max(1, quantity);
  return Math.max(0, Number(unitPrice.toFixed(2)));
};

export const resolveBestDiscountPromotion = (
  promotions: BroadcastRecord[],
  sku: string,
  quantity: number,
) => {
  const code = sku.trim();
  if (!code) return null;

  const eligible = promotions.filter((promotion) => {
    if (promotion.type !== "discount") return false;
    if (!promotion.code) return false;
    if (promotion.code.trim().toUpperCase() !== code.toUpperCase()) return false;

    const minOrder =
      promotion.min_order !== null && promotion.min_order !== undefined
        ? toNumber(promotion.min_order, 0)
        : null;
    if (minOrder !== null && minOrder > 0 && quantity < minOrder) return false;

    const value =
      promotion.discount_value !== null && promotion.discount_value !== undefined
        ? toNumber(promotion.discount_value, 0)
        : 0;
    return value > 0;
  });

  if (eligible.length === 0) return null;

  // Prefer the promo that yields the greatest total discount at the given quantity.
  return eligible
    .map((promotion) => {
      const baseUnit = 1;
      const preview = applyDiscountToUnitPrice(baseUnit, quantity, promotion);
      return { promotion, discount: baseUnit - preview };
    })
    .sort((a, b) => b.discount - a.discount)[0]?.promotion ?? null;
};
