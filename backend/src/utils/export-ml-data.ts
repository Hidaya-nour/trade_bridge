import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { setupAssociations } from '../models/associations';
import Order from '../models/order.model';
import OrderItems from '../models/order-item.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import Review from '../models/rating-reviews.model';
import { Delivery } from '../models/delivery.model';

// Initialize Sequelize (assuming you have a database config)
import sequelize from '../config/database'; // Adjust path as needed

async function exportDemandForecastingData() {
  console.log('Exporting demand forecasting data...');

  // Query historical orders with items
  const orders = await Order.findAll({
    include: [
      {
        model: OrderItems,
        as: 'items',
        include: [{ model: Product, as: 'product' }],
      },
    ],
    where: {
      order_status: ['delivered', 'closed'], // Only completed orders in TradeBridge
      created_at: {
        [Op.lt]: new Date(), // All past orders
      },
    },
    order: [['created_at', 'ASC']],
  });

  const data = [];
  for (const order of orders) {
    const orderDate = order.created_at.toISOString().split('T')[0]; // YYYY-MM-DD
    for (const item of order.items || []) {
      if (item.product) {
        data.push({
          date: orderDate,
          product_id: item.product.id.toString(),
          quantity_sold: item.quantity,
        });
      }
    }
  }

  // Write to CSV
  const csv = 'date,product_id,quantity_sold\n' + data.map(row => `${row.date},${row.product_id},${row.quantity_sold}`).join('\n');
  const outputDir = path.join(__dirname, '../../../ml/data');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'demand_data.csv'), csv);
  console.log(`Exported ${data.length} demand records to ml/data/demand_data.csv`);
}

async function exportSupplierRecommendationData() {
  console.log('Exporting distributor recommendation data...');

  // Retailers should be recommended distributors, not factories.
  const distributors = await User.findAll({
    where: { role: 'distributor', status: 'active' },
  });

  const data = [];
  for (const supplier of distributors) {
    // Get products for this distributor.
    const products = await Product.findAll({
      where: { supplier_id: supplier.id },
    });

    let totalOrders = 0;
    let onTimeDeliveries = 0;
    let totalDeliveries = 0;
    let avgQualityRating = 0;
    let totalReviews = 0;
    let totalFulfillmentTime = 0;
    let totalPrices = 0;

    for (const product of products) {
      // Get order items for this product
      const orderItems = await OrderItems.findAll({
        where: { product_id: product.id },
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              { model: Delivery, as: 'delivery' },
            ],
          },
        ],
      });

      for (const orderItem of orderItems) {
        const order = orderItem.order;
        if (order && ['delivered', 'closed'].includes(order.order_status)) {
          totalOrders++;
          if (order.delivery) {
            totalDeliveries++;
            // For now, assume on-time if delivered within 7 days of order
            const orderDate = new Date(order.created_at);
            const deliveryDate = order.delivery.completed_at ? new Date(order.delivery.completed_at) : null;
            if (deliveryDate) {
              const daysToDeliver = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
              if (daysToDeliver <= 7) { // Assume 7 days is on-time
                onTimeDeliveries++;
              }
              totalFulfillmentTime += daysToDeliver;
            }
          }
          // Price
          totalPrices += orderItem.unit_price || 0;

          // Reviews for this product
          const reviews = await Review.findAll({
            where: { product_id: product.id },
          });
          for (const review of reviews) {
            if (review.rating) {
              avgQualityRating += review.rating;
              totalReviews++;
            }
          }
        }
      }
    }

    if (totalOrders > 0) {
      const onTimeRate = totalDeliveries > 0 ? onTimeDeliveries / totalDeliveries : 0;
      const avgRating = totalReviews > 0 ? avgQualityRating / totalReviews : 0;
      const avgFulfill = totalDeliveries > 0 ? totalFulfillmentTime / totalDeliveries : 0;
      const avgPrice = totalPrices / totalOrders;

      // Suitability score
      let suitability = 1;
      if (onTimeRate > 0.8 && avgRating > 3.5) suitability = 5;
      else if (onTimeRate > 0.6 && avgRating > 3) suitability = 4;
      else if (onTimeRate > 0.4) suitability = 3;
      else if (onTimeRate > 0.2) suitability = 2;

      data.push({
        supplier_id: supplier.id,
        on_time_delivery_rate: onTimeRate,
        quality_rating: avgRating,
        order_fulfillment_time: avgFulfill,
        price_competitiveness: avgPrice,
        total_orders: totalOrders,
        suitability_score: suitability,
      });
    }
  }

  // Write to CSV
  const csv = 'supplier_id,on_time_delivery_rate,quality_rating,order_fulfillment_time,price_competitiveness,total_orders,suitability_score\n' +
    data.map(row => `${row.supplier_id},${row.on_time_delivery_rate},${row.quality_rating},${row.order_fulfillment_time},${row.price_competitiveness},${row.total_orders},${row.suitability_score}`).join('\n');
  const outputDir = path.join(__dirname, '../../../ml/data');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'supplier_data.csv'), csv);
  console.log(`Exported ${data.length} distributor records to ml/data/supplier_data.csv`);
}

async function exportTradeBridgeSnapshot() {
  console.log('Exporting TradeBridge ML snapshot...');

  const outputDir = path.join(__dirname, '../../../ml/data/processed');
  fs.mkdirSync(outputDir, { recursive: true });

  const users = await User.findAll({
    where: {
      role: ['retailer', 'distributor'],
      status: 'active',
    },
    attributes: [
      'id',
      'full_name',
      'business_name',
      'role',
      'status',
      'verified',
      'created_at',
    ],
  });

  const products = await Product.findAll({
    attributes: [
      'id',
      'supplier_id',
      'name',
      'category',
      'price',
      'stock_quantity',
      'min_order_amount',
      'unit_type',
      'pickup_location',
      'rating',
      'review_count',
      'is_available',
      'created_at',
    ],
  });

  const orders = await Order.findAll({
    include: [
      {
        model: OrderItems,
        as: 'items',
        include: [{ model: Product, as: 'product' }],
      },
    ],
    attributes: [
      'id',
      'buyer_id',
      'supplier_id',
      'total_price',
      'order_status',
      'created_at',
    ],
    order: [['created_at', 'ASC']],
  });

  const snapshot = {
    exported_at: new Date().toISOString(),
    users: users.map((user) => ({
      id: user.id,
      full_name: user.full_name,
      business_name: user.business_name,
      role: user.role,
      status: user.status,
      verified: user.verified,
      created_at: user.created_at?.toISOString?.() ?? user.created_at,
    })),
    products: products.map((product) => ({
      id: product.id,
      supplier_id: product.supplier_id,
      name: product.name,
      category: product.category,
      price: Number(product.price || 0),
      stock_quantity: Number(product.stock_quantity || 0),
      min_order_amount: Number(product.min_order_amount || 1),
      unit_type: product.unit_type,
      pickup_location: product.pickup_location,
      rating: Number(product.rating || 0),
      review_count: Number(product.review_count || 0),
      is_available: product.is_available,
      created_at: product.created_at?.toISOString?.() ?? product.created_at,
    })),
    orders: orders.map((order) => ({
      id: order.id,
      buyer_id: order.buyer_id,
      supplier_id: order.supplier_id,
      total_price: Number(order.total_price || 0),
      order_status: order.order_status,
      created_at: order.created_at?.toISOString?.() ?? order.created_at,
      items: (order.items || []).map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price || 0),
        name: item.product?.name,
        category: item.product?.category,
      })),
    })),
  };

  fs.writeFileSync(
    path.join(outputDir, 'tradebridge_snapshot.json'),
    JSON.stringify(snapshot, null, 2),
    'utf8',
  );
  console.log(
    `Exported ${snapshot.users.length} users, ${snapshot.products.length} products, and ${snapshot.orders.length} orders to ml/data/processed/tradebridge_snapshot.json`,
  );
}

async function main() {
  try {
    await sequelize.authenticate();
    setupAssociations();

    await exportDemandForecastingData();
    await exportSupplierRecommendationData();
    await exportTradeBridgeSnapshot();

    console.log('Data export completed!');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await sequelize.close();
  }
}

main();
