import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format price in ETB
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  const parsed = typeof price === "string" ? Number(price) : price;
  const safePrice = Number.isFinite(parsed as number) ? Number(parsed) : 0;

  return `ETB ${safePrice.toLocaleString(undefined, {
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

// src/lib/export.ts

interface ExportDataItem {
  [key: string]: any;
}

/**
 * Export data as CSV file
 */
export const exportToCSV = (data: ExportDataItem[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  ).join('\n');
  
  const csv = `${headers}\n${rows}`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export data as Excel file (requires xlsx package)
 */
export const exportToExcel = async (data: ExportDataItem[], filename: string) => {
  try {
    // Dynamically import xlsx to avoid increasing bundle size
    const XLSX = await import('xlsx');
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    throw new Error('Excel export failed. Make sure xlsx package is installed.');
  }
};

/**
 * Export data as PDF file (requires jspdf and jspdf-autotable packages)
 */
export const exportToPDF = async (data: ExportDataItem[], filename: string, title: string = 'Product Report') => {
  try {
    // Dynamically import PDF libraries
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const headers = [Object.keys(data[0])];
    const rows = data.map(obj => Object.values(obj));
    
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total Items: ${data.length}`, 14, 28);
    
    (doc as any).autoTable({
      head: headers,
      body: rows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(filename);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    throw new Error('PDF export failed. Make sure jspdf and jspdf-autotable are installed.');
  }
};

/**
 * Format product data for export
 */
export const formatProductDataForExport = (products: any[]) => {
  return products.map(product => ({
    'Product Name': product.name,
    'Category': product.category,
    'Price (ETB)': product.price,
    'Stock Quantity': product.stock_quantity,
    'Unit Type': product.unit_type,
    'Min Order': product.min_order_amount,
    'Status': product.is_available ? 'Active' : 'Inactive',
    'Total Value (ETB)': (product.stock_quantity || 0) * product.price,
    'Rating': product.rating || 'N/A',
    'Last Updated': product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'
  }));
};
