// src/seeders/17_chat_messages.js
import { faker } from '@faker-js/faker';
import { ChatMessage } from '../models/chat-message.model.js';

export default async function seedChatMessages(seededData) {
  const users = seededData.users;
  const orders = seededData.orders;
  const activeOrders = orders.filter(o => o.order_status !== 'closed' && o.order_status !== 'cancelled');
  
  const messages = [];
  
  for (const order of activeOrders.slice(0, 200)) { // Limit for performance
    const buyer = users.find(u => u.id === order.buyer_id);
    const supplier = users.find(u => u.id === order.supplier_id);
    
    if (!buyer || !supplier) continue;
    
    const numMessages = faker.number.int({ min: 0, max: 12 });
    const messageDates = [];
    
    for (let i = 0; i < numMessages; i++) {
      messageDates.push(faker.date.between({ from: order.created_at, to: new Date() }));
    }
    messageDates.sort();
    
    for (let i = 0; i < numMessages; i++) {
      const sender = faker.datatype.boolean(0.5) ? buyer : supplier;
      const receiver = sender.id === buyer.id ? supplier : buyer;
      
      messages.push({
        id: faker.string.uuid(),
        sender_id: sender.id,
        receiver_id: receiver.id,
        order_id: order.id,
        message: faker.lorem.sentence({ min: 4, max: 20 }),
        is_read: faker.datatype.boolean(0.8),
        created_at: messageDates[i],
        updated_at: messageDates[i],
      });
    }
  }
  
  if (messages.length) {
    await ChatMessage.bulkCreate(messages, { ignoreDuplicates: true });
  }
  
  return messages;
}