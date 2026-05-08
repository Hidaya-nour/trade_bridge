// src/seeders/13_inventory_movements.js
import { faker } from '@faker-js/faker';
import { InventoryMovement } from '../models/inventory-movement.model.ts';
import { Product } from '../models/product.model.ts';

const MOVEMENT_TYPES = ['in', 'out', 'adjustment'];
const MOVEMENT_REASONS = {
  in: ['purchase', 'restock', 'return', 'production'],
  out: ['sale', 'damage', 'expired', 'transfer'],
  adjustment: ['inventory_count', 'quality_check'],
};

export default async function seedInventoryMovements(seededData) {
  const products = seededData.products;
  const users = seededData.users;
  const orders = seededData.orders;
  
  const movements = [];
  const suppliers = users.filter(u => u.role === 'factory' || u.role === 'distributor');
  
  for (const product of products) {
    const supplier = suppliers.find(s => s.id === product.supplier_id);
    if (!supplier) continue;
    
    // Number of movements based on product age
    const productAge = new Date() - new Date(product.created_at);
    const daysOld = productAge / (1000 * 60 * 60 * 24);
    const numMovements = Math.min(50, Math.floor(daysOld / 7) + faker.number.int({ min: 1, max: 10 }));
    
    let currentStock = product.stock_quantity;
    
    for (let i = 0; i < numMovements; i++) {
      const movementDate = faker.date.between({ from: product.created_at, to: new Date() });
      const movementType = faker.helpers.arrayElement(MOVEMENT_TYPES);
      let quantity = faker.number.int({ min: 10, max: 500 });
      let reason = faker.helpers.arrayElement(MOVEMENT_REASONS[movementType]);
      
      // Adjust quantity based on stock levels
      if (movementType === 'out' && quantity > currentStock) {
        quantity = Math.max(1, currentStock);
      } else if (movementType === 'in') {
        currentStock += quantity;
      } else if (movementType === 'out') {
        currentStock -= quantity;
      }
      
      movements.push({
        id: faker.string.uuid(),
        product_id: product.id,
        movement_type: movementType,
        quantity: quantity,
        reason: `${reason} - ${faker.lorem.word()}`,
        user_id: supplier.id,
        created_at: movementDate,
        updated_at: movementDate,
      });
    }
    
    // Update product stock
    await Product.update(
      { stock_quantity: currentStock },
      { where: { id: product.id } }
    );
  }
  
  await InventoryMovement.bulkCreate(movements, { ignoreDuplicates: true });
  return movements;
}
