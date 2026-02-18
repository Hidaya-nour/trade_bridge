import { Delivery } from './delivery.model';
import { DeliveryEvent } from './DeliveryEvent.model';
import OrderItems from './order-item.model';
import Order from './order.model';
import { Payment } from './payment.model';
import { Product } from './product.model';
import RefreshToken from './RefreshToken.model';
import { User } from './user.model';

// This function must be called AFTER all models are imported
export const setupAssociations = () => {
  console.log('🔗 Setting up associations...');
  
  // User has many RefreshTokens
  User.hasMany(RefreshToken, {
    foreignKey: 'user_id',
    as: 'refreshTokens',
    onDelete: 'CASCADE'
  });

  // RefreshToken belongs to User
  RefreshToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User - Product (Supplier)
  User.hasMany(Product, {
    foreignKey: 'supplier_id',
    as: 'products',
    onDelete: 'CASCADE'
  });
  Product.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier'
  });

   // User - Orders (as buyer)
  User.hasMany(Order, {
    foreignKey: 'buyer_id',
    as: 'buyerOrders'
  });
  Order.belongsTo(User, {
    foreignKey: 'buyer_id',
    as: 'buyer'
  });

  // User - Orders (as supplier)
  User.hasMany(Order, {
    foreignKey: 'supplier_id',
    as: 'supplierOrders'
  });
  Order.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier'
  });

  // Order - OrderItems
  Order.hasMany(OrderItems, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE'
  });
  OrderItems.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // OrderItem - Product
  OrderItems.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });
  Product.hasMany(OrderItems, {
    foreignKey: 'product_id',
    as: 'orderItems'
  });

  // Order - Payment (one-to-one)
  Order.hasOne(Payment, {
    foreignKey: 'order_id',
    as: 'payment'
  });
  Payment.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // Order - Delivery (one-to-one)
  Order.hasOne(Delivery, {
    foreignKey: 'order_id',
    as: 'delivery'
  });
  Delivery.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // Delivery - DeliveryEvents
  Delivery.hasMany(DeliveryEvent, {
    foreignKey: 'delivery_id',
    as: 'events',
    onDelete: 'CASCADE'
  });
  DeliveryEvent.belongsTo(Delivery, {
    foreignKey: 'delivery_id',
    as: 'delivery'
  });

  // User - Delivery (as driver)
  User.hasMany(Delivery, {
    foreignKey: 'driver_id',
    as: 'driverDeliveries'
  });
  Delivery.belongsTo(User, {
    foreignKey: 'driver_id',
    as: 'driver'
  });
  console.log('✅ Associations defined successfully');
};