// src/seeders/seedHelpers.js
import { faker } from '@faker-js/faker';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sample image URLs for products (real product images from Cloudinary demo)
const PRODUCT_IMAGE_URLS = [
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/farm-products/rice-bag.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/farm-products/wheat-flour.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/coffee-beans.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/spices.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/cacao.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/vegetables/carrots.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/fruits/apples.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/meat/steak.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/dairy/milk.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/tea-leaves.jpg',
];

// Ethiopian regions and cities
export const regions = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 
  'Sidama', 'Harari', 'Dire Dawa', 'Afar', 'Somali', 'Benishangul-Gumuz', 'Gambela'
];

export const cities = {
  'Addis Ababa': ['Bole', 'Kirkos', 'Lideta', 'Gulele', 'Yeka', 'Nifas Silk', 'Kolfe', 'Akaki', 'Addis Ketema', 'Arada'],
  'Oromia': ['Adama', 'Bishoftu', 'Shashemene', 'Jimma', 'Nekemte', 'Ambo', 'Asella', 'Bale', 'Arsi', 'Wollega'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Lalibela', 'Debre Tabor', 'Woldia', 'Kombolcha'],
  'Tigray': ['Mekelle', 'Adwa', 'Axum', 'Shire', 'Adigrat', 'Humera'],
  'SNNPR': ['Hawassa', 'Arba Minch', 'Sodo', 'Jinka', 'Wolaita Sodo', 'Dilla'],
  'Sidama': ['Hawassa', 'Yirgalem', 'Aleta Wondo', 'Wonji'],
  'Harari': ['Harar'],
  'Dire Dawa': ['Dire Dawa City', 'Gende Kora', 'Dechatu'],
  'Afar': ['Semera', 'Assayita', 'Dubti'],
  'Somali': ['Jijiga', 'Gode', 'Kebri Dahar', 'Shinile'],
  'Benishangul-Gumuz': ['Assosa', 'Metekel'],
  'Gambela': ['Gambela', 'Itang'],
};

export const productCategories = [
  'Grains & Cereals', 'Vegetables', 'Fruits', 'Dairy Products', 'Meat & Poultry',
  'Coffee & Tea', 'Spices & Herbs', 'Edible Oils', 'Processed Foods', 'Beverages',
  'Honey'
];

export const unitTypes = ['kg', 'g', 'ton', 'liter', 'ml', 'piece', 'box', 'bag', 'crate', 'bundle', 'carton', 'pallet'];

const CATEGORY_PRODUCT_CATALOG = {
  'Grains & Cereals': ['Long Grain Rice', 'Whole Wheat Flour', 'Maize Grain', 'Barley Grain', 'Sorghum Grain', 'Oats'],
  'Vegetables': ['Fresh Tomato', 'White Onion', 'Green Cabbage', 'Potato', 'Carrot', 'Green Pepper'],
  'Fruits': ['Banana', 'Orange', 'Mango', 'Avocado', 'Pineapple', 'Apple'],
  'Dairy Products': ['Fresh Whole Milk', 'Yogurt', 'Butter', 'Cheddar Cheese', 'Skim Milk Powder', 'Cream'],
  'Meat & Poultry': ['Beef Cuts', 'Chicken Whole', 'Chicken Breast', 'Goat Meat', 'Mutton', 'Beef Mince'],
  'Coffee & Tea': ['Arabica Coffee Beans', 'Ground Coffee', 'Black Tea Leaves', 'Green Tea', 'Roasted Coffee', 'Instant Coffee'],
  'Spices & Herbs': ['Turmeric Powder', 'Paprika', 'Black Pepper', 'Cumin', 'Coriander', 'Cardamom'],
  'Edible Oils': ['Sunflower Oil', 'Palm Oil', 'Soybean Oil', 'Canola Oil', 'Sesame Oil', 'Olive Oil'],
  'Processed Foods': ['Pasta', 'Tomato Paste', 'Biscuit', 'Instant Noodles', 'Canned Beans', 'Breakfast Cereal'],
  'Beverages': ['Mineral Water', 'Malt Drink', 'Fruit Juice', 'Carbonated Drink', 'Energy Drink', 'Sparkling Water'],
  'Honey': ['Raw Honey', 'Filtered Honey', 'Forest Honey', 'Wildflower Honey', 'Organic Honey', 'Acacia Honey'],
};

const CATEGORY_DESCRIPTION_HINTS = {
  'Grains & Cereals': 'Food-grade grains suitable for milling, baking, and cooking.',
  'Vegetables': 'Fresh produce suitable for wholesale retail and kitchen use.',
  'Fruits': 'Fresh fruit graded for distribution and daily consumption.',
  'Dairy Products': 'Pasteurized and quality-checked dairy products for food service and retail.',
  'Meat & Poultry': 'Hygienically handled meat and poultry for food distribution.',
  'Coffee & Tea': 'Aromatic beverage ingredients processed for consistency and flavor.',
  'Spices & Herbs': 'Flavoring ingredients prepared for culinary use.',
  'Edible Oils': 'Refined edible oils for cooking and food processing.',
  'Processed Foods': 'Packaged food items with stable shelf-life and retail-ready labeling.',
  'Beverages': 'Ready-to-drink and refreshment products for distribution.',
  'Honey': 'Natural sweetener sourced and packaged for food use.',
};

export const generateFoodProductData = (category) => {
  const catalog = CATEGORY_PRODUCT_CATALOG[category] || ['Food Product'];
  const productBaseName = faker.helpers.arrayElement(catalog);
  const variant = faker.helpers.arrayElement(['Premium', 'Standard', 'Wholesale']);
  const packaging = faker.helpers.arrayElement(['Bulk Pack', 'Retail Pack', 'Family Pack']);
  const grade = faker.helpers.arrayElement(['Grade A', 'Grade B', 'Premium']);
  const descriptionHint = CATEGORY_DESCRIPTION_HINTS[category] || 'Food and drink product for distribution.';

  return {
    name: `${productBaseName} - ${variant}`,
    description: `${descriptionHint} ${packaging}. ${grade} quality.`,
  };
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const getRandomItems = (arr, min = 1, max = null) => {
  if (!arr || arr.length === 0) return [];
  const count = max ? faker.number.int({ min, max }) : min;
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const getRandomDate = (startDate, endDate) => {
  return faker.date.between({ from: startDate, to: endDate });
};

export const getRandomStatus = (statuses, weights = null) => {
  if (weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < statuses.length; i++) {
      if (random < weights[i]) return statuses[i];
      random -= weights[i];
    }
  }
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Cloudinary upload helper
export const uploadToCloudinary = async (imageUrl, folder, publicId, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        timeout: 60000,
      });
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error(`Cloudinary upload attempt ${attempt} failed:`, error.message);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
};

// Generate product images
export const generateProductImages = async (productId, productName, index) => {
  const imageCount = faker.number.int({ min: 1, max: 3 });
  const images = [];
  
  for (let i = 0; i < imageCount; i++) {
    const imageUrl = PRODUCT_IMAGE_URLS[(index + i) % PRODUCT_IMAGE_URLS.length];
    const uploadResult = await uploadToCloudinary(
      imageUrl,
      `trade_bridge/products/${productId}`,
      `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${i}`
    );
    
    if (uploadResult) {
      images.push({
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        format: uploadResult.format,
        is_primary: i === 0,
        width: uploadResult.width,
        height: uploadResult.height,
      });
    } else {
      // Fallback to Lorem Picsum
      images.push({
        url: `https://picsum.photos/id/${(index + i) % 1000}/400/400`,
        is_primary: i === 0,
      });
    }
    
    // Rate limiting to avoid Cloudinary API limits
    if (!process.env.SKIP_CLOUDINARY) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return images;
};

// Document upload helper
export const uploadDocument = async (userId, docType, index) => {
  const docUrls = {
    id_card: 'https://res.cloudinary.com/demo/image/upload/v1/samples/documents/id-card-sample.pdf',
    business_license: 'https://res.cloudinary.com/demo/image/upload/v1/samples/documents/business-license.pdf',
    tax_certificate: 'https://res.cloudinary.com/demo/image/upload/v1/samples/documents/tax-certificate.pdf',
    other: 'https://res.cloudinary.com/demo/image/upload/v1/samples/documents/contract.pdf',
  };
  
  const docUrl = docUrls[docType] || docUrls.other;
  const uploadResult = await uploadToCloudinary(
    docUrl,
    `trade_bridge/documents/${userId}`,
    `${userId}_${docType}_${Date.now()}`
  );
  
  if (uploadResult) {
    return {
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_resource_type: uploadResult.resource_type,
      cloudinary_format: uploadResult.format,
      file_secure_url: uploadResult.secure_url,
      file_size: uploadResult.bytes,
      original_file_name: `${docType}_document.pdf`,
    };
  }
  return null;
};

// Business logic helpers
export const calculateDeliveryFee = (product, distanceKm = null) => {
  if (!product.delivery_available) return null;
  if (product.delivery_pricing === 'free') return 0;
  
  const actualDistance = distanceKm || faker.number.float({ min: 1, max: 50 });
  const feePerKm = parseFloat(product.delivery_fee_per_km) || 5;
  const freeDistance = parseFloat(product.free_delivery_max_distance_km) || 0;
  
  if (freeDistance > 0 && actualDistance <= freeDistance) return 0;
  return parseFloat((actualDistance * feePerKm).toFixed(2));
};

export const calculateOrderTotal = (items, deliveryFee = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  return parseFloat((subtotal + deliveryFee).toFixed(2));
};

export const getOrderStatusTimeline = (createdAt, status) => {
  const timeline = { created_at: createdAt };
  let currentDate = new Date(createdAt);
  
  switch (status) {
    case 'approved':
      timeline.approved_at = faker.date.between({ 
        from: currentDate, 
        to: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) 
      });
      break;
    case 'processing':
      timeline.approved_at = faker.date.between({ 
        from: currentDate, 
        to: new Date(currentDate.getTime() + 1 * 60 * 60 * 1000) 
      });
      timeline.processing_at = faker.date.between({ 
        from: timeline.approved_at, 
        to: new Date(timeline.approved_at.getTime() + 48 * 60 * 60 * 1000) 
      });
      break;
    case 'shipped':
      timeline.approved_at = faker.date.between({ 
        from: currentDate, 
        to: new Date(currentDate.getTime() + 1 * 60 * 60 * 1000) 
      });
      timeline.processing_at = faker.date.between({ 
        from: timeline.approved_at, 
        to: new Date(timeline.approved_at.getTime() + 48 * 60 * 60 * 1000) 
      });
      timeline.shipped_at = faker.date.between({ 
        from: timeline.processing_at, 
        to: new Date(timeline.processing_at.getTime() + 72 * 60 * 60 * 1000) 
      });
      break;
    case 'delivered':
      timeline.approved_at = faker.date.between({ 
        from: currentDate, 
        to: new Date(currentDate.getTime() + 1 * 60 * 60 * 1000) 
      });
      timeline.processing_at = faker.date.between({ 
        from: timeline.approved_at, 
        to: new Date(timeline.approved_at.getTime() + 48 * 60 * 60 * 1000) 
      });
      timeline.shipped_at = faker.date.between({ 
        from: timeline.processing_at, 
        to: new Date(timeline.processing_at.getTime() + 72 * 60 * 60 * 1000) 
      });
      timeline.delivered_at = faker.date.between({ 
        from: timeline.shipped_at, 
        to: new Date(timeline.shipped_at.getTime() + 120 * 60 * 60 * 1000) 
      });
      break;
    case 'cancelled':
      timeline.cancelled_at = faker.date.between({ 
        from: currentDate, 
        to: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) 
      });
      break;
  }
  
  return timeline;
};

// Generate Ethiopian phone number
export const generateEthiopianPhone = () => {
  const prefixes = ['09', '07', '091', '092', '093', '094', '095', '096', '097', '098'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(prefix === '09' ? 8 : 7);
  return `${prefix}${number}`;
};

// Generate TIN number
export const generateTIN = () => {
  return faker.string.numeric(10);
};
