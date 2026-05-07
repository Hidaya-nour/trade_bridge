// src/seeders/12_delivery_events.js
import { faker } from '@faker-js/faker';
import { DeliveryEvent } from '../models/DeliveryEvent.model.js';

const EVENT_TYPES = ['assigned', 'picked_up', 'in_transit', 'arrived_at_region', 'out_for_delivery', 'delivered', 'issue_reported'];

export default async function seedDeliveryEvents(seededData) {
  const deliveries = seededData.deliveries;
  
  const events = [];
  
  for (const delivery of deliveries) {
    if (delivery.status === 'pending') continue;
    
    const startDate = delivery.started_at || delivery.created_at;
    const endDate = delivery.completed_at || new Date();
    
    let numEvents = 2;
    if (delivery.status === 'picked_up') numEvents = 3;
    if (delivery.status === 'delivered') numEvents = faker.number.int({ min: 4, max: 7 });
    
    const eventDates = [];
    for (let i = 0; i < numEvents; i++) {
      eventDates.push(faker.date.between({ from: startDate, to: endDate }));
    }
    eventDates.sort();
    
    for (let i = 0; i < numEvents; i++) {
      const eventType = EVENT_TYPES[Math.min(i, EVENT_TYPES.length - 1)];
      
      events.push({
        id: faker.string.uuid(),
        delivery_id: delivery.id,
        event_type: eventType,
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        note: faker.datatype.boolean(0.4) ? `Status: ${eventType.replace('_', ' ')}` : null,
        created_at: eventDates[i],
      });
    }
  }
  
  await DeliveryEvent.bulkCreate(events, { ignoreDuplicates: true });
  return events;
}