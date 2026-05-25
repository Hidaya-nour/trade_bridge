// src/scripts/test-delivery-wallet-flow.ts
import sequelize from '../config/database';
import User from '../models/user.model';
import Order from '../models/order.model';
import Payment from '../models/payment.model';
import Delivery from '../models/delivery.model';
import Driver from '../models/driver.model';
import deliveryService from '../services/delivery/delivery.service';
import crypto from 'crypto';

async function runTest() {
  console.log('--- Starting Integration Test: Delivery to Wallet Flow ---');
  try {
    await sequelize.authenticate();
    console.log('Database connection OK.');

    // 1. Create a unique suffix to avoid collision
    const suffix = crypto.randomUUID().slice(0, 8);

    // 2. Create supplier
    const supplier = await User.create({
      id: crypto.randomUUID(),
      full_name: `Test Supplier ${suffix}`,
      email: `supplier_${suffix}@test.com`,
      phone: `0900000${suffix.slice(0, 4)}`,
      password: 'HashPassword123',
      role: 'distributor',
      status: 'active',
      pending_balance: 0,
      available_balance: 0,
    } as any);

    // 3. Create buyer
    const buyer = await User.create({
      id: crypto.randomUUID(),
      full_name: `Test Buyer ${suffix}`,
      email: `buyer_${suffix}@test.com`,
      phone: `0910000${suffix.slice(0, 4)}`,
      password: 'HashPassword123',
      role: 'retailer',
      status: 'active',
    } as any);

    // 4. Create driver
    const driverUser = await User.create({
      id: crypto.randomUUID(),
      full_name: `Test Driver ${suffix}`,
      email: `driver_${suffix}@test.com`,
      phone: `0920000${suffix.slice(0, 4)}`,
      password: 'HashPassword123',
      role: 'driver',
      status: 'active',
    } as any);

    const driverRecord = await Driver.create({
      id: crypto.randomUUID(),
      driver_id: driverUser.id,
      supplier_id: supplier.id,
      vehicle_type: 'Truck',
      license_plate: `ET-${suffix.toUpperCase()}`,
      active: true,
    } as any);

    // 5. Create Order (marked processing)
    const order = await Order.create({
      id: crypto.randomUUID(),
      buyer_id: buyer.id,
      supplier_id: supplier.id,
      total_price: 1000.00,
      order_status: 'processing',
    } as any);

    // 6. Create Payment (marked completed and pending settlement)
    const payment = await Payment.create({
      id: crypto.randomUUID(),
      order_id: order.id,
      payment_method: 'chapa',
      total_amount: 1000.00,
      amount_paid: 1000.00,
      payment_status: 'completed',
      seller_net_amount: 980.00, // Assuming 2% platform fee
      platform_fee_amount: 20.00,
      settlement_status: 'pending',
    } as any);

    // Manually add payment net to supplier's pending_balance (simulating payment completion flow)
    supplier.pending_balance = 980.00;
    await supplier.save();

    console.log(`Created supplier: ${supplier.email} with pending balance = ${supplier.pending_balance}`);
    console.log(`Created order: ${order.id} with status = ${order.order_status}`);
    console.log(`Created payment with settlement_status = ${payment.settlement_status}`);

    // 7. Create Delivery (status = pending)
    const delivery = await Delivery.create({
      id: crypto.randomUUID(),
      order_id: order.id,
      driver_id: driverRecord.id,
      status: 'pending',
      pickup_location: 'Warehouse A',
      dropoff_location: 'Store B',
    } as any);

    console.log(`Created delivery: ${delivery.id} with status = ${delivery.status}`);

    // 8. Transition delivery to picked_up (driver context)
    console.log('Transitioning delivery status to: picked_up');
    await deliveryService.updateDeliveryStatus(delivery.id, 'picked_up', driverUser.id, 'driver');

    // Verify order status updated to shipped
    await order.reload();
    console.log(`Order status after pickup: ${order.order_status}`);
    if (String(order.order_status) !== 'shipped') {
      throw new Error(`Expected order status to be 'shipped', got '${order.order_status}'`);
    }

    // 9. Transition delivery to delivered (driver context)
    console.log('Transitioning delivery status to: delivered');
    await deliveryService.updateDeliveryStatus(delivery.id, 'delivered', driverUser.id, 'driver');

    // Reload all records to verify final state
    await delivery.reload();
    await order.reload();
    await payment.reload();
    await supplier.reload();

    console.log('\n--- Final Verification ---');
    console.log(`Delivery status: ${delivery.status}`);
    console.log(`Order status: ${order.order_status}`);
    console.log(`Payment settlement status: ${payment.settlement_status}`);
    console.log(`Supplier pending balance: ${supplier.pending_balance}`);
    console.log(`Supplier available balance: ${supplier.available_balance}`);

    // Assertions
    if (String(delivery.status) !== 'delivered') {
      throw new Error(`Expected delivery status 'delivered', got '${delivery.status}'`);
    }
    if (String(order.order_status) !== 'closed') {
      throw new Error(`Expected order status 'closed', got '${order.order_status}'`);
    }
    if (String(payment.settlement_status) !== 'released') {
      throw new Error(`Expected payment settlement_status 'released', got '${payment.settlement_status}'`);
    }
    if (Number(supplier.pending_balance) !== 0) {
      throw new Error(`Expected pending balance 0, got ${supplier.pending_balance}`);
    }
    if (Number(supplier.available_balance) !== 980.00) {
      throw new Error(`Expected available balance 980.00, got ${supplier.available_balance}`);
    }

    console.log('\n✅ Integration Test Passed! Flow is perfectly synchronized.');

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
  } finally {
    await sequelize.close();
  }
}

runTest();
