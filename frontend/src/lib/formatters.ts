/**
 * Format price in ETB
 */
export const formatPrice = (price: number): string => {
  return `ETB ${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format price in compact form (1.2M, 45K, etc)
 */
export const formatCompactPrice = (price: number): string => {
  if (price >= 1_000_000) {
    return `ETB ${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `ETB ${(price / 1_000).toFixed(0)}K`;
  }
  return `ETB ${price}`;
};

/**
 * Format date to short format (Feb 13, 2026)
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date with time (Feb 13, 2026, 14:30)
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format time only (14:30)
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ✅ NEW FUNCTION: Format phone number
/**
 * Format Ethiopian phone number
 * Converts +251912345678 to +251 91 234 5678
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return "";
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Ethiopian format: +251 XX XXX XXXX
  if (cleaned.startsWith("251") && cleaned.length === 12) {
    return `+251 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
  }
  
  // Local format: 0912345678
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+251 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  }
  
  // If already formatted or unknown format, return as is
  return phone;
};

/**
 * Get relative time (5 minutes ago, 2 hours ago, etc)
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
};

/**
 * Format percentage with + sign for positive values
 */
export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

/**
 * Format number with commas (1,234,567)
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Format number in compact form (1.2M, 45K, etc)
 */
export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
};