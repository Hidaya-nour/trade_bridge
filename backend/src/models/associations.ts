import { Delivery } from './delivery.model';
import { DeliveryEvent } from './DeliveryEvent.model';
import OrderItems from './order-item.model';
import Order from './order.model';
import { Payment } from './payment.model';
import { Product } from './product.model';
import RefreshToken from './RefreshToken.model';
import { User } from './user.model';
import Driver from './driver.model';
import Notification from './notification.model';
import Cart from './cart.model';
import CartItem from './cart-item.model';
import InventoryMovement from './inventory-movement.model';
import ChatMessage from './chat-message.model';
import Document from './document.model';
import Address from './address.model';
import Review from './rating-reviews.model';
import Dispute from './dispute.model';
import SupplierReview from './supplier-review.model';
import DriverReview from './driver-review.model';
import UserReport from './user-report.model';
import DriverIssueReport from './driver-issue-report.model';
import FactoryAgent from './factory-agent.model';
import SupplierPaymentMethod from './supplier-payment-method.model';

// This function must be called AFTER all models are imported
export const setupAssociations = () => {
  console.log('🔗 Setting up associations...');

  // User - RefreshTokens
  User.hasMany(RefreshToken, {
    foreignKey: 'user_id',
    as: 'refreshTokens',
    onDelete: 'CASCADE',
  });

  RefreshToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // User - Product (Supplier)
  User.hasMany(Product, {
    foreignKey: 'supplier_id',
    as: 'products',
    onDelete: 'CASCADE',
  });

  Product.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier',
  });

  // User - SupplierPaymentMethod (Supplier)
  User.hasMany(SupplierPaymentMethod, {
    foreignKey: 'supplier_id',
    as: 'paymentMethods',
    onDelete: 'CASCADE',
  });

  SupplierPaymentMethod.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier',
  });

  // User - Orders (buyer)
  User.hasMany(Order, {
    foreignKey: 'buyer_id',
    as: 'buyerOrders',
  });

  Order.belongsTo(User, {
    foreignKey: 'buyer_id',
    as: 'buyer',
  });

  // User - Orders (supplier)
  User.hasMany(Order, {
    foreignKey: 'supplier_id',
    as: 'supplierOrders',
  });

  Order.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier',
  });

  // Order - OrderItems
  Order.hasMany(OrderItems, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE',
  });

  OrderItems.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });

  // OrderItem - Product
  OrderItems.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
  });

  Product.hasMany(OrderItems, {
    foreignKey: 'product_id',
    as: 'orderItems',
  });

  // Order - Payment
  Order.hasOne(Payment, {
    foreignKey: 'order_id',
    as: 'payment',
  });

  Payment.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });

  // Payment - Document
  Payment.belongsTo(Document, {
    foreignKey: 'proof_document_id',
    as: 'proofDocument',
  });

  Document.hasMany(Payment, {
    foreignKey: 'proof_document_id',
    as: 'paymentsWithProof',
  });

  // Order - Delivery
  Order.hasOne(Delivery, {
    foreignKey: 'order_id',
    as: 'delivery',
  });

  Delivery.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });

  // Delivery - DeliveryEvents
  Delivery.hasMany(DeliveryEvent, {
    foreignKey: 'delivery_id',
    as: 'events',
    onDelete: 'CASCADE',
  });

  DeliveryEvent.belongsTo(Delivery, {
    foreignKey: 'delivery_id',
    as: 'delivery',
  });

  // Driver - Delivery (IMPORTANT FIX)
  Driver.hasMany(Delivery, {
    foreignKey: 'driver_id',
    as: 'deliveries',
  });

  Delivery.belongsTo(Driver, {
    foreignKey: 'driver_id',
    as: 'driver',
  });

  // User - Notifications
  User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
    onDelete: 'CASCADE',
  });

  Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // User - Cart
  User.hasOne(Cart, {
    foreignKey: 'user_id',
    as: 'cart',
    onDelete: 'CASCADE',
  });

  Cart.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Cart - CartItems
  Cart.hasMany(CartItem, {
    foreignKey: 'cart_id',
    as: 'items',
    onDelete: 'CASCADE',
  });

  CartItem.belongsTo(Cart, {
    foreignKey: 'cart_id',
    as: 'cart',
  });

  // CartItem - Product
  CartItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
  });

  Product.hasMany(CartItem, {
    foreignKey: 'product_id',
    as: 'cartItems',
  });

  // InventoryMovement
  InventoryMovement.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
  });

  Product.hasMany(InventoryMovement, {
    foreignKey: 'product_id',
    as: 'inventoryMovements',
  });

  InventoryMovement.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  User.hasMany(InventoryMovement, {
    foreignKey: 'user_id',
    as: 'inventoryMovements',
  });

  // ChatMessage - Sender
  ChatMessage.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender',
  });

  User.hasMany(ChatMessage, {
    foreignKey: 'sender_id',
    as: 'sentMessages',
  });

  // ChatMessage - Receiver
  ChatMessage.belongsTo(User, {
    foreignKey: 'receiver_id',
    as: 'receiver',
  });

  User.hasMany(ChatMessage, {
    foreignKey: 'receiver_id',
    as: 'receivedMessages',
  });

  // ChatMessage - Order
  ChatMessage.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });

  Order.hasMany(ChatMessage, {
    foreignKey: 'order_id',
    as: 'chatMessages',
  });

  // Disputes
  Dispute.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });

  Order.hasMany(Dispute, {
    foreignKey: 'order_id',
    as: 'disputes',
  });

  Dispute.belongsTo(User, {
    foreignKey: 'raised_by',
    as: 'raisedByUser',
  });

  User.hasMany(Dispute, {
    foreignKey: 'raised_by',
    as: 'raisedDisputes',
  });

  Dispute.belongsTo(User, {
    foreignKey: 'against_user',
    as: 'againstUser',
  });

  User.hasMany(Dispute, {
    foreignKey: 'against_user',
    as: 'receivedDisputes',
  });

  Dispute.belongsTo(User, {
    foreignKey: 'resolved_by',
    as: 'resolvedByUser',
  });

  User.hasMany(Dispute, {
    foreignKey: 'resolved_by',
    as: 'resolvedDisputes',
  });

  // Documents
  Document.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  User.hasMany(Document, {
    foreignKey: 'user_id',
    as: 'documents',
  });

  // Addresses
  Address.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  User.hasMany(Address, {
    foreignKey: 'user_id',
    as: 'addresses',
  });

  // Product Reviews
  Product.hasMany(Review, {
    foreignKey: 'product_id',
    as: 'reviews',
    onDelete: 'CASCADE',
  });

  Review.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
  });

  Review.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews',
  });

  // Supplier Reviews (User -> SupplierReview with two roles)
  User.hasMany(SupplierReview, {
    foreignKey: 'supplier_id',
    as: 'supplierReviewsReceived',
    onDelete: 'CASCADE',
  });

  User.hasMany(SupplierReview, {
    foreignKey: 'user_id',
    as: 'supplierReviewsWritten',
    onDelete: 'CASCADE',
  });

  SupplierReview.belongsTo(User, {
    foreignKey: 'supplier_id',
    as: 'supplier',
  });

  SupplierReview.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'reviewer',
  });

  // Driver Reviews (User -> DriverReview with two roles, plus Delivery)
  Delivery.hasOne(DriverReview, {
    foreignKey: 'delivery_id',
    as: 'driverReview',
    onDelete: 'CASCADE',
  });

  DriverReview.belongsTo(Delivery, {
    foreignKey: 'delivery_id',
    as: 'delivery',
  });

  User.hasMany(DriverReview, {
    foreignKey: 'driver_user_id',
    as: 'driverReviewsReceived',
    onDelete: 'CASCADE',
  });

  User.hasMany(DriverReview, {
    foreignKey: 'buyer_id',
    as: 'driverReviewsWritten',
    onDelete: 'CASCADE',
  });

  DriverReview.belongsTo(User, {
    foreignKey: 'driver_user_id',
    as: 'driverUser',
  });

  DriverReview.belongsTo(User, {
    foreignKey: 'buyer_id',
    as: 'buyer',
  });

  // User Reports
  User.hasMany(UserReport, {
    foreignKey: 'reporter_id',
    as: 'reportsMade',
    onDelete: 'CASCADE',
  });

  User.hasMany(UserReport, {
    foreignKey: 'reported_user_id',
    as: 'reportsReceived',
    onDelete: 'CASCADE',
  });

  UserReport.belongsTo(User, {
    foreignKey: 'reporter_id',
    as: 'reporter',
  });

  UserReport.belongsTo(User, {
    foreignKey: 'reported_user_id',
    as: 'reportedUser',
  });

  Order.hasMany(UserReport, {
    foreignKey: 'order_id',
    as: 'reports',
    onDelete: 'SET NULL',
  });

  UserReport.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
  });

  // Driver relationships
  Driver.belongsTo(User, { foreignKey: 'supplier_id', as: 'supplier' });
  // Use a distinct alias to avoid case-insensitive conflicts with Driver model alias in MySQL.
  Driver.belongsTo(User, { foreignKey: 'driver_id', as: 'driverUser' });

  User.hasMany(Driver, { foreignKey: 'supplier_id', as: 'supplierDrivers' });
  User.hasMany(Driver, { foreignKey: 'driver_id', as: 'assignedDrivers' });

  // Factory Agent relationships
  FactoryAgent.belongsTo(User, { foreignKey: 'factory_id', as: 'factory' });
  FactoryAgent.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });
  FactoryAgent.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  FactoryAgent.belongsTo(Document, {
    foreignKey: 'contract_document_id',
    as: 'contractDocument',
  });

  User.hasMany(FactoryAgent, { foreignKey: 'factory_id', as: 'factoryAgents' });
  User.hasMany(FactoryAgent, { foreignKey: 'agent_id', as: 'agentContracts' });

  // Driver Issue Reports
  DriverIssueReport.belongsTo(User, { foreignKey: 'driver_id', as: 'driverUser' });
  User.hasMany(DriverIssueReport, { foreignKey: 'driver_id', as: 'driverIssueReports' });

  DriverIssueReport.belongsTo(Delivery, { foreignKey: 'delivery_id', as: 'delivery' });
  Delivery.hasMany(DriverIssueReport, { foreignKey: 'delivery_id', as: 'issueReports' });

  console.log('✅ Associations defined successfully');
};
