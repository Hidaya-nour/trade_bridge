import type { PaymentMethod } from '@/types/payment.types';

export const supplierMethodTypeToPaymentMethod = (
  methodType: string,
): PaymentMethod | null => {
  switch (methodType) {
    case 'cash_on_delivery':
      return 'cash';
    case 'mobile_money':
      return 'mobile_banking';
    case 'bank_transfer':
      return 'cheque';
    case 'credit_card':
      return 'chapa';
    case 'other':
      return 'credit';
    default:
      return null;
  }
};

export const supplierMethodsToPaymentMethods = (
  supplierMethods: Array<{ method_type: string }> | undefined,
): PaymentMethod[] => {
  if (!supplierMethods || supplierMethods.length === 0) return [];
  const methods = supplierMethods
    .map((m) => supplierMethodTypeToPaymentMethod(m.method_type))
    .filter((m): m is PaymentMethod => Boolean(m));

  return Array.from(new Set(methods));
};
