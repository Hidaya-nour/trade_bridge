// src/seeders/10_payments.js
import { faker } from '@faker-js/faker';
import { Payment } from '../models/payment.model.js';
import { getRandomStatus } from './seedHelpers.js';

const PAYMENT_METHODS = ['mobile_banking', 'chapa', 'credit'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];
const STATUS_WEIGHTS = [0.1, 0.75, 0.1, 0.05];

export default async function seedPayments(seededData) {
  const orders = seededData.orders;
  const users = seededData.users;
  const admins = users.filter(u => u.role === 'admin');
  
  const payments = [];
  
  for (const order of orders) {
    // Skip cancelled orders for payment
    if (order.order_status === 'cancelled') continue;
    
    const paymentMethod = faker.helpers.arrayElement(PAYMENT_METHODS);
    let paymentStatus = PAYMENT_STATUSES[0];
    
    // Determine payment status based on order status
    if (['delivered', 'closed'].includes(order.order_status)) {
      paymentStatus = 'completed';
    } else if (order.order_status === 'cancelled') {
      paymentStatus = 'failed';
    } else if (order.order_status === 'pending') {
      paymentStatus = 'pending';
    } else {
      paymentStatus = getRandomStatus(PAYMENT_STATUSES, STATUS_WEIGHTS);
    }
    
    const paymentDate = paymentStatus === 'completed' 
      ? faker.date.between({ from: order.created_at, to: new Date() })
      : null;
    
    const refundAmount = paymentStatus === 'refunded' 
      ? parseFloat((order.total_price * faker.number.float({ min: 0.5, max: 1 })).toFixed(2))
      : null;
    
    payments.push({
      id: faker.string.uuid(),
      order_id: order.id,
      payment_method: paymentMethod,
      total_amount: order.total_price,
      amount_paid: paymentStatus === 'completed' ? order.total_price : 0,
      payment_status: paymentStatus,
      chapa_transaction_id: paymentMethod === 'chapa' ? `chapa_tx_${faker.string.alphanumeric(16)}` : null,
      chapa_payment_url: paymentMethod === 'chapa' ? `https://checkout.chapa.co/${faker.string.alphanumeric(32)}` : null,
      proof_document_id: null,
      refund_amount: refundAmount,
      refund_reason: refundAmount ? faker.lorem.sentence() : null,
      refund_date: refundAmount ? faker.date.between({ from: order.created_at, to: new Date() }) : null,
      refunded_by: refundAmount ? faker.helpers.arrayElement(admins)?.id : null,
      payment_date: paymentDate,
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
      created_at: order.created_at,
      updated_at: paymentDate || order.updated_at,
      deleted_at: null,
    });
  }
  
  await Payment.bulkCreate(payments, { ignoreDuplicates: true });
  return payments;
}
