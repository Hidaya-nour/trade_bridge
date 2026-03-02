// utils/sku-generator.ts
export const generateSKU = (product: any): string => {
  const prefix = getCategoryPrefix(product.category);
  const supplierCode = product.supplier_id?.substring(0, 4).toUpperCase() || 'SUPP';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-6);
  
  return `${prefix}-${supplierCode}-${timestamp}-${randomNum}`;
};

const getCategoryPrefix = (category: string): string => {
  const prefixes: Record<string, string> = {
    'electronics': 'ELEC',
    'clothing': 'CLTH',
    'food': 'FOOD',
    'furniture': 'FURN',
    'machinery': 'MACH',
    'raw_materials': 'RAW',
    'chemicals': 'CHEM',
    // Add more categories
  };
  
  return prefixes[category.toLowerCase()] || 'GEN';
};