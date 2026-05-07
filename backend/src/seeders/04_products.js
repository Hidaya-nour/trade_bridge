// src/seeders/04_products.js
import { faker } from '@faker-js/faker';
import { Product } from '../models/product.model.js';
import { 
  productCategories, unitTypes, generateProductImages, 
  getRandomItems, getRandomStatus, generateFoodProductData
} from './seedHelpers.js';

const generateSKU = (category, index) => {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index + 1).padStart(6, '0')}`;
};

export default async function seedProducts(seededData, options = {}) {
  const users = seededData.users;
  const suppliers = users.filter(u => u.role === 'factory' || u.role === 'distributor');
  
  // Filter active suppliers only
  const activeSuppliers = suppliers.filter(s => s.status === 'active');
  
  const products = [];
  let productCounter = 0;
  
  // Products per supplier: 5-30 depending on size
  for (const supplier of activeSuppliers) {
    const numProducts = supplier.role === 'factory' 
      ? faker.number.int({ min: 10, max: 40 })
      : faker.number.int({ min: 5, max: 20 });
    
    for (let i = 0; i < numProducts && productCounter < 500; i++) {
      const category = faker.helpers.arrayElement(productCategories);
      const productData = generateFoodProductData(category);
      const unitType = faker.helpers.arrayElement(unitTypes);
      const basePrice = parseFloat(faker.commerce.price({ min: 50, max: 5000 }));
      const isAvailable = getRandomStatus([true, false], [0.85, 0.15]);
      
      let productImages = [];
      if (!options.skipCloudinary) {
        productImages = await generateProductImages(productCounter, productCounter);
      } else {
        productImages = [{ url: `https://picsum.photos/id/${productCounter % 1000}/400/400`, is_primary: true }];
      }
      
      products.push({
        id: faker.string.uuid(),
        supplier_id: supplier.id,
        name: productData.name,
        category: category,
        sku: generateSKU(category, productCounter),
        description: productData.description,
        pickup_location: faker.location.streetAddress(),
        specifications: {
          weight: `${faker.number.int({ min: 1, max: 100 })}kg`,
          origin: faker.location.country(),
          grade: faker.helpers.arrayElement(['A', 'B', 'C', 'Premium']),
          certification: faker.helpers.arrayElement(['ISO', 'HACCP', 'Organic', 'None']),
        },
        price: basePrice,
        stock_quantity: faker.number.int({ min: 0, max: 10000 }),
        min_order_amount: faker.number.int({ min: 1, max: 100 }),
        unit_type: unitType,
        images: productImages,
        is_available: isAvailable,
        rating: 0,
        review_count: 0,
        delivery_available: faker.datatype.boolean(0.8),
        delivery_pricing: faker.helpers.arrayElement(['free', 'paid']),
        delivery_fee_per_km: parseFloat(faker.commerce.price({ min: 2, max: 20 })),
        free_delivery_max_distance_km: faker.number.int({ min: 5, max: 30 }),
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
      
      productCounter++;
    }
  }
  
  await Product.bulkCreate(products, { ignoreDuplicates: true });
  return products;
}
