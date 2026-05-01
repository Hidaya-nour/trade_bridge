import type { PaymentMethod } from '@/types/payment.types';

export const supplierMethodTypeToPaymentMethod = (
  methodType: string,
): PaymentMethod | null => {
  switch (methodType) {
    case 'mobile_money':
    case 'mobile_banking':
      return 'mobile_banking';
    case 'credit_card':
    case 'chapa':
      return 'app_payment';
    case 'credit':
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

export const getPaymentMethodLabel = (
  method?: string | null,
): string => {
  switch (method) {
    case "app_payment":
    case "chapa":
      return "App Payment";
    case "mobile_banking":
      return "Mobile Banking";
    case "credit":
      return "Buy on Credit";
    case undefined:
    case null:
    case "":
      return "N/A";
    default:
      return method;
  }
};
