import { Delivery } from './delivery.model';
import { DeliveryEvent } from './DeliveryEvent.model';
import OrderItems from './order-item.model';
import Order from './order.model';
import { Payment } from './payment.model';
import { Product } from './product.model';
import RefreshToken from './RefreshToken.model';
import { User } from './user.model';
import Notification from './notification.model';
import Cart from './cart.model';
import CartItem from './cart-item.model';
import InventoryMovement from './inventory-movement.model';
import ChatMessage from './chat-message.model';
import Document from './document.model';
import Address from './address.model';

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
  
  // User - Notifications
  User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
    onDelete: 'CASCADE'
  });
  Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User - Cart
  User.hasOne(Cart, {
    foreignKey: 'user_id',
    as: 'cart',
    onDelete: 'CASCADE'
  });
  Cart.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Cart - CartItems
  Cart.hasMany(CartItem, {
    foreignKey: 'cart_id',
    as: 'items',
    onDelete: 'CASCADE'
  });
  CartItem.belongsTo(Cart, {
    foreignKey: 'cart_id',
    as: 'cart'
  });

  // CartItem - Product
  CartItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });
  Product.hasMany(CartItem, {
    foreignKey: 'product_id',
    as: 'cartItems'
  });

  // InventoryMovement - Product
  InventoryMovement.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });
  Product.hasMany(InventoryMovement, {
    foreignKey: 'product_id',
    as: 'inventoryMovements'
  });

  // InventoryMovement - User
  InventoryMovement.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  User.hasMany(InventoryMovement, {
    foreignKey: 'user_id',
    as: 'inventoryMovements'
  });

  // ChatMessage - User (sender)
  ChatMessage.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });
  User.hasMany(ChatMessage, {
    foreignKey: 'sender_id',
    as: 'sentMessages'
  });

  // ChatMessage - User (receiver)
  ChatMessage.belongsTo(User, {
    foreignKey: 'receiver_id',
    as: 'receiver'
  });
  User.hasMany(ChatMessage, {
    foreignKey: 'receiver_id',
    as: 'receivedMessages'
  });

  // ChatMessage - Order
  ChatMessage.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  Order.hasMany(ChatMessage, {
    foreignKey: 'order_id',
    as: 'chatMessages'
  });

  // User - Documents
  Document.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  User.hasMany(Document, {
    foreignKey: 'user_id',
    as: 'documents'
  });

  // User - Addresses
  Address.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  User.hasMany(Address, {
    foreignKey: 'user_id',
    as: 'addresses'
  });

  console.log('✅ Associations defined successfully');
};